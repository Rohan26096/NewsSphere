
const mongoose = require("mongoose");

const articleInsightSchema = new mongoose.Schema(
    {
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "News",
            required: true,
            unique: true,
            index: true
        },

        contentHash: {
            type: String,
            required: true
        },

        insights: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        model: {
            type: String,
            default: "gemini-3.5-flash-lite"
        },

        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ArticleInsight",
    articleInsightSchema
);
