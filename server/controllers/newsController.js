
const News = require("../models/News");
const UserProfile = require("../models/UserProfile");
const { fetchTopHeadlines } = require("../services/gnewsService");

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


const calculateRecommendationScore = (article, profile) => {
    let score = 0;
    const matchedTopics = [];

    const title = (article.title || "").toLowerCase();
    const description = (article.description || "").toLowerCase();
    const content = (article.content || "").toLowerCase();

    const articleTopics = (article.topics || []).map(topic =>
        topic.toLowerCase()
    );

    (profile.topics || []).forEach(topic => {
        const keyword = topic.toLowerCase().trim();

        if (!keyword) return;

        let topicMatched = false;

        if (title.includes(keyword)) {
            score += 5;
            topicMatched = true;
        }

        if (description.includes(keyword)) {
            score += 3;
            topicMatched = true;
        }

        if (content.includes(keyword)) {
            score += 2;
            topicMatched = true;
        }

        if (articleTopics.includes(keyword)) {
            topicMatched = true;
        }

        if (topicMatched) {
            matchedTopics.push(topic);
        }
    });

    // Reward articles matching multiple profile topics.
    if (matchedTopics.length > 1) {
        score += (matchedTopics.length - 1) * 2;
    }

    const articleCategory = (article.category || "").toLowerCase();

    const categoryMatched = (profile.categories || []).some(
        category => category.toLowerCase() === articleCategory
    );

    if (categoryMatched) {
        score += 2;
    }

    return {
        score,
        matchedTopics,
        categoryMatched
    };
};


// GET NEWS FROM DATABASE
const getAllNews = async (req, res) => {
    try {
        const {
            category,
            topic,
            search,
            edition,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = {
                $regex: `^${escapeRegex(category)}$`,
                $options: "i"
            };
        }

        if (topic) filter.topics = topic;

        if (edition === "india") {
            filter.$or = [
                { edition: "india" },
                {
                    edition: { $exists: false },
                    country: "in"
                }
            ];
        } else if (edition === "global") {
            filter.edition = "global";
        } else if (edition) {
            return res.status(400).json({
                success: false,
                message: "Edition must be india or global"
            });
        }

        if (search) {
            filter.title = {
                $regex: escapeRegex(search),
                $options: "i"
            };
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const perPage = Math.min(50, Math.max(1, Number(limit) || 10));

        const [news, total] = await Promise.all([
            News.find(filter)
                .sort({ publishedAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage),

            News.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            total,
            page: currentPage,
            totalPages: Math.ceil(total / perPage),
            news
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET NEWS BY ID
const getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News article not found"
            });
        }

        res.status(200).json({
            success: true,
            news
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid news ID"
        });
    }
};

// FETCH EXTERNAL NEWS
const getExternalNews = async (req, res) => {
    try {
        const category = req.query.category || "general";
        const edition = req.query.edition || "india";

        const articles = await fetchTopHeadlines(category, edition);

        res.status(200).json({
            success: true,
            edition,
            total: articles.length,
            articles
        });

    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message
        });
    }
};

// FETCH AND SAVE NEWS TO MONGODB
const syncExternalNews = async (req, res) => {
    try {
        const category = req.query.category || "general";
        const edition = req.query.edition || "india";

        if (!["india", "global"].includes(edition)) {
            return res.status(400).json({
                success: false,
                message: "Edition must be india or global"
            });
        }

        const articles = await fetchTopHeadlines(category, edition);

        if (!articles.length) {
            return res.status(200).json({
                success: true,
                message: "No articles received from GNews",
                edition,
                fetched: 0,
                inserted: 0,
                existing: 0
            });
        }

        const operations = articles
            .filter(article => article.title && article.url)
            .map(article => ({
                updateOne: {
                    filter: { url: article.url },
                    update: {
                        $set: {
                            title: article.title,
                            description: article.description || "",
                            content: article.content || "",
                            url: article.url,
                            image: article.image || "",
                            source: {
                                name: article.source?.name || "",
                                url: article.source?.url || ""
                            },
                            author: article.author || "",
                            publishedAt: article.publishedAt
                                ? new Date(article.publishedAt)
                                : null,
                            category,
                            topics: [category],
                            language: "en",
                            country: edition === "india" ? "in" : "",
                            edition,
                            provider: "gnews"
                        }
                    },
                    upsert: true
                }
            }));

        if (!operations.length) {
            return res.status(200).json({
                success: true,
                message: "No valid articles to save",
                edition,
                fetched: articles.length,
                inserted: 0,
                existing: 0
            });
        }

        const result = await News.bulkWrite(operations, {
            ordered: false
        });

        res.status(200).json({
            success: true,
            message: "News synced successfully",
            edition,
            fetched: articles.length,
            inserted: result.upsertedCount,
            existing: result.matchedCount
        });

    } catch (error) {
        console.error("News sync error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET PERSONALIZED NEWS FOR A PROFILE

const getPersonalizedNews = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const profile = await UserProfile.findOne({
            _id: profileId,
            user: req.userId
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        const topics = (profile.topics || [])
            .map(topic => topic.trim())
            .filter(Boolean);

        const categories = (profile.categories || [])
            .map(category => category.trim())
            .filter(Boolean);

        const matchingConditions = [];

        topics.forEach(topic => {
            const regex = new RegExp(escapeRegex(topic), "i");

            matchingConditions.push(
                { title: regex },
                { description: regex },
                { content: regex },
                { topics: regex }
            );
        });

        categories.forEach(category => {
            matchingConditions.push({
                category: {
                    $regex: `^${escapeRegex(category)}$`,
                    $options: "i"
                }
            });
        });

        if (!matchingConditions.length) {
            return res.status(200).json({
                success: true,
                profile: {
                    id: profile._id,
                    name: profile.name,
                    description: profile.description,
                    topics,
                    categories
                },
                total: 0,
                page: 1,
                totalPages: 0,
                news: []
            });
        }

        // Retrieve candidates before pagination.
        const candidates = await News.find({
            $or: matchingConditions
        })
            .sort({ publishedAt: -1 })
            .limit(500)
            .lean();

        // Calculate relevance for every candidate.
        const rankedNews = candidates
            .map(article => {
                const recommendation =
                    calculateRecommendationScore(article, profile);

                return {
                    ...article,
                    recommendationScore: recommendation.score,
                    matchedTopics: recommendation.matchedTopics,
                    categoryMatched: recommendation.categoryMatched
                };
            })
            .filter(article => article.recommendationScore > 0)
            .sort((a, b) => {
                if (
                    b.recommendationScore !== a.recommendationScore
                ) {
                    return b.recommendationScore -
                        a.recommendationScore;
                }

                return (
                    new Date(b.publishedAt || 0) -
                    new Date(a.publishedAt || 0)
                );
            });

        const currentPage = Math.max(1, Number(page) || 1);
        const perPage = Math.min(50, Math.max(1, Number(limit) || 10));

        const total = rankedNews.length;

        const startIndex = (currentPage - 1) * perPage;

        const paginatedNews = rankedNews.slice(
            startIndex,
            startIndex + perPage
        );

        res.status(200).json({
            success: true,
            profile: {
                id: profile._id,
                name: profile.name,
                description: profile.description,
                topics,
                categories
            },
            total,
            page: currentPage,
            totalPages: Math.ceil(total / perPage),
            news: paginatedNews
        });

    } catch (error) {
        console.error("Personalized recommendation error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getAllNews,
    getNewsById,
    getExternalNews,
    syncExternalNews,
    getPersonalizedNews
};
