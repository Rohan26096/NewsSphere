
const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        content: {
            type: String,
            default: ""
        },

        url: {
            type: String,
            required: true,
            unique: true
        },

        image: {
            type: String,
            default: ""
        },

        source: {
            name: String,
            url: String
        },

        author: {
            type: String,
            default: ""
        },

        publishedAt: Date,

        category: {
            type: String,
            default: "general"
        },

        topics: [{
            type: String
        }],

        language: {
            type: String,
            default: "en"
        },

        country: {
            type: String,
            default: ""
        },

        provider: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

newsSchema.index({ publishedAt: -1 });
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ topics: 1 });

module.exports = mongoose.model("News", newsSchema);
