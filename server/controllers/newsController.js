
const News = require("../models/News");

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

module.exports = {
    getAllNews,
    getNewsById
};
