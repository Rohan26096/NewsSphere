
const Bookmark = require("../models/Bookmark");
const News = require("../models/News");

// ADD BOOKMARK
const addBookmark = async (req, res) => {
    try {
        const { type, articleId, topic } = req.body;

        if (!["article", "topic"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type must be article or topic"
            });
        }

        const bookmarkData = {
            user: req.userId,
            type
        };

        if (type === "article") {
            if (!articleId) {
                return res.status(400).json({
                    success: false,
                    message: "Article ID is required"
                });
            }

            const article = await News.findById(articleId);

            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: "Article not found"
                });
            }

            bookmarkData.article = article._id;
        }

        if (type === "topic") {
            if (typeof topic !== "string" || !topic.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Topic is required"
                });
            }

            bookmarkData.topic = topic.trim();
        }

        const bookmark = await Bookmark.create(bookmarkData);

        res.status(201).json({
            success: true,
            message: "Bookmark added successfully",
            bookmark
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Already bookmarked"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL BOOKMARKS
const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({
            user: req.userId
        })
            .populate("article")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: bookmarks.length,
            bookmarks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE BOOKMARK
const deleteBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!bookmark) {
            return res.status(404).json({
                success: false,
                message: "Bookmark not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bookmark removed successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid bookmark ID"
        });
    }
};

module.exports = {
    addBookmark,
    getBookmarks,
    deleteBookmark
};
