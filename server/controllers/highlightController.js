
const Highlight = require("../models/Highlight");
const News = require("../models/News");

// CREATE HIGHLIGHT
const createHighlight = async (req, res) => {
    try {
        const { articleId, selectedText, note = "" } = req.body;

        if (!articleId || typeof selectedText !== "string" ||
            !selectedText.trim()) {
            return res.status(400).json({
                success: false,
                message: "Article ID and selected text are required"
            });
        }

        if (typeof note !== "string") {
            return res.status(400).json({
                success: false,
                message: "Note must be a string"
            });
        }

        const article = await News.findById(articleId);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        const highlight = await Highlight.create({
            user: req.userId,
            article: article._id,
            selectedText: selectedText.trim(),
            note: note.trim()
        });

        res.status(201).json({
            success: true,
            message: "Highlight saved successfully",
            highlight
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This text is already highlighted"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL HIGHLIGHTS
const getHighlights = async (req, res) => {
    try {
        const highlights = await Highlight.find({
            user: req.userId
        })
            .populate("article", "title url image source publishedAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: highlights.length,
            highlights
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE HIGHLIGHT NOTE
const updateHighlight = async (req, res) => {
    try {
        const { note } = req.body;

        if (typeof note !== "string") {
            return res.status(400).json({
                success: false,
                message: "A valid note is required"
            });
        }

        const highlight = await Highlight.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            {
                $set: { note: note.trim() }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!highlight) {
            return res.status(404).json({
                success: false,
                message: "Highlight not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Highlight updated successfully",
            highlight
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid highlight ID"
        });
    }
};

// DELETE HIGHLIGHT
const deleteHighlight = async (req, res) => {
    try {
        const highlight = await Highlight.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!highlight) {
            return res.status(404).json({
                success: false,
                message: "Highlight not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Highlight deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid highlight ID"
        });
    }
};

module.exports = {
    createHighlight,
    getHighlights,
    updateHighlight,
    deleteHighlight
};
