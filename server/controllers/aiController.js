
const crypto = require("crypto");

const News = require("../models/News");
const ArticleInsight = require("../models/ArticleInsight");
const ArticleChat = require("../models/ArticleChat");

const {
    generateArticleInsights,
    chatWithArticle
} = require("../services/geminiService");

// Generate or retrieve AI article insights
const getArticleInsights = async (req, res) => {
    try {
        const { articleId, forceRefresh = false } = req.body;

        if (!articleId) {
            return res.status(400).json({
                success: false,
                message: "Article ID is required."
            });
        }

        if (!/^[a-fA-F0-9]{24}$/.test(articleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid article ID."
            });
        }

        const article = await News.findById(articleId);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found."
            });
        }

        const articleContent = [
            article.title,
            article.description,
            article.content
        ].filter(Boolean).join("\n\n").slice(0, 15000);

        if (articleContent.trim().length < 30) {
            return res.status(400).json({
                success: false,
                message: "Not enough article content to generate insights."
            });
        }

        const contentHash = crypto
            .createHash("sha256")
            .update(articleContent)
            .digest("hex");

        const cachedInsight = await ArticleInsight.findOne({
            article: articleId
        });

        if (
            cachedInsight &&
            cachedInsight.contentHash === contentHash &&
            !forceRefresh
        ) {
            return res.status(200).json({
                success: true,
                cached: true,
                articleId: article._id,
                insights: cachedInsight.insights
            });
        }

        const insights = await generateArticleInsights({
            title: article.title,
            description: article.description,
            content: articleContent,
            category: article.category,
            source: article.source
        });

        await ArticleInsight.findOneAndUpdate(
            { article: articleId },
            {
                $set: {
                    contentHash,
                    insights,
                    model: "gemini-3.5-flash-lite",
                    generatedAt: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            success: true,
            cached: false,
            articleId: article._id,
            insights
        });

    } catch (error) {
        console.error("AI insights error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to generate article insights. Please try again."
        });
    }
};

// Ask a question about an article and save the conversation
const askArticleQuestion = async (req, res) => {
    try {
        const { articleId, question, history = [] } = req.body;

        if (!articleId || !/^[a-fA-F0-9]{24}$/.test(articleId)) {
            return res.status(400).json({
                success: false,
                message: "A valid article ID is required."
            });
        }

        if (!question || typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a question."
            });
        }

        if (question.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Question is too long."
            });
        }

        if (
            !Array.isArray(history) ||
            history.length > 10 ||
            history.some(item =>
                !["user", "assistant"].includes(item.role) ||
                typeof item.content !== "string" ||
                item.content.length > 4000
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation history."
            });
        }

        const article = await News.findById(articleId);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found."
            });
        }

        const answer = await chatWithArticle(
            article,
            question.trim(),
            history
        );

        // Save the question and answer for this user and article
        await ArticleChat.findOneAndUpdate(
            {
                user: req.userId,
                article: articleId
            },
            {
                $push: {
                    messages: {
                        $each: [
                            {
                                role: "user",
                                content: question.trim()
                            },
                            {
                                role: "assistant",
                                content: answer
                            }
                        ]
                    }
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            answer
        });

    } catch (error) {
        console.error("Article chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to answer your question. Please try again."
        });
    }
};

// Get the saved conversation for an article
const getArticleChat = async (req, res) => {
    try {
        const { articleId } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(articleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid article ID."
            });
        }

        const chat = await ArticleChat.findOne({
            user: req.userId,
            article: articleId
        }).select("messages");

        return res.status(200).json({
            success: true,
            messages: chat ? chat.messages : []
        });

    } catch (error) {
        console.error("Get article chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load conversation."
        });
    }
};

// Clear the saved conversation for an article
const clearArticleChat = async (req, res) => {
    try {
        const { articleId } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(articleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid article ID."
            });
        }

        await ArticleChat.findOneAndDelete({
            user: req.userId,
            article: articleId
        });

        return res.status(200).json({
            success: true,
            message: "Conversation cleared successfully."
        });

    } catch (error) {
        console.error("Clear article chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to clear conversation."
        });
    }
};

module.exports = {
    getArticleInsights,
    askArticleQuestion,
    getArticleChat,
    clearArticleChat
};
