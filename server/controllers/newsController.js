
const News = require("../models/News");
const { fetchTopHeadlines } = require("../services/gnewsService");

// Get all news
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

        if (category) {
            filter.category = category;
        }

        if (topic) {
            filter.topics = topic;
        }

        if (search) {
            filter.title = {
                $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i"
            };
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const perPage = Math.min(50, Math.max(1, Number(limit) || 10));

        const news = await News.find(filter)
            .sort({ publishedAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        const total = await News.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: currentPage,
            totalPages: Math.ceil(total / perPage),
            news
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get news by ID
const getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                message: "News article not found"
            });
        }

        res.status(200).json({
            success: true,
            news
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid news ID"
        });
    }
};

// Fetch external news from GNews
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


// Fetch news and save it to MongoDB
const syncExternalNews = async (req, res) => {
    try {
        const category = req.query.category || "general";

        // Fetch articles from GNews
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

        // Prepare articles for MongoDB
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

        // Insert new articles or update existing ones
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


module.exports = {
    getAllNews,
    getNewsById,
    getExternalNews,
    syncExternalNews,

};
