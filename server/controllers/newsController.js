
const News = require("../models/News");
const UserProfile = require("../models/UserProfile");
const { fetchTopHeadlines } = require("../services/gnewsService");

// Escape special regex characters
const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET ALL NEWS
const getAllNews = async (req, res) => {
    try {
        const {
            category,
            topic,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (category) filter.category = category;
        if (topic) filter.topics = topic;

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

// FETCH EXTERNAL NEWS FROM GNEWS
const getExternalNews = async (req, res) => {
    try {
        const category = req.query.category || "general";
        const articles = await fetchTopHeadlines(category);

        res.status(200).json({
            success: true,
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

// FETCH EXTERNAL NEWS AND SAVE TO MONGODB
const syncExternalNews = async (req, res) => {
    try {
        const category = req.query.category || "general";
        const articles = await fetchTopHeadlines(category);

        if (!articles.length) {
            return res.status(200).json({
                success: true,
                message: "No articles received from GNews",
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
                            country: "in",
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
        const {
            page = 1,
            limit = 10
        } = req.query;

        // Find profile belonging to logged-in user
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

        // Build topic matching conditions
        const topicConditions = profile.topics.flatMap(topic => {
            const regex = new RegExp(escapeRegex(topic), "i");

            return [
                { title: regex },
                { description: regex },
                { content: regex },
                { topics: regex }
            ];
        });

        // Include selected categories
        const categoryConditions = profile.categories.map(category => ({
            category: {
                $regex: `^${escapeRegex(category)}$`,
                $options: "i"
            }
        }));

        const matchingConditions = [
            ...topicConditions,
            ...categoryConditions
        ];

        if (!matchingConditions.length) {
            return res.status(200).json({
                success: true,
                profile: profile.name,
                total: 0,
                page: 1,
                totalPages: 0,
                news: []
            });
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const perPage = Math.min(50, Math.max(1, Number(limit) || 10));

        const filter = {
            $or: matchingConditions
        };

        const [news, total] = await Promise.all([
            News.find(filter)
                .sort({ publishedAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage),

            News.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            profile: {
                id: profile._id,
                name: profile.name,
                topics: profile.topics,
                categories: profile.categories
            },
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

module.exports = {
    getAllNews,
    getNewsById,
    getExternalNews,
    syncExternalNews,
    getPersonalizedNews
};
