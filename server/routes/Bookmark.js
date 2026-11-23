
const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["article", "topic"],
            required: true
        },

        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "News"
        },

        topic: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate article bookmarks
bookmarkSchema.index(
    { user: 1, article: 1 },
    {
        unique: true,
        partialFilterExpression: { type: "article" }
    }
);

// Prevent duplicate topic bookmarks
bookmarkSchema.index(
    { user: 1, topic: 1 },
    {
        unique: true,
        partialFilterExpression: { type: "topic" }
    }
);

bookmarkSchema.pre("validate", function (next) {
    if (this.type === "article" && !this.article) {
        this.invalidate("article", "Article ID is required");
    }

    if (this.type === "topic" && !this.topic) {
        this.invalidate("topic", "Topic is required");
    }

    next();
});

module.exports = mongoose.model("Bookmark", bookmarkSchema);
