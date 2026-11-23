
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
            ref: "News",
            required: function () {
                return this.type === "article";
            }
        },

        topic: {
            type: String,
            trim: true,
            required: function () {
                return this.type === "topic";
            }
        }
    },
    {
        timestamps: true
    }
);

bookmarkSchema.index(
    { user: 1, article: 1 },
    {
        unique: true,
        partialFilterExpression: { type: "article" }
    }
);

bookmarkSchema.index(
    { user: 1, topic: 1 },
    {
        unique: true,
        partialFilterExpression: { type: "topic" }
    }
);

module.exports = mongoose.model("Bookmark", bookmarkSchema);
