
const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "News",
            required: true
        },

        selectedText: {
            type: String,
            required: true,
            trim: true
        },

        note: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Avoid saving the same highlighted text twice for one user/article
highlightSchema.index(
    { user: 1, article: 1, selectedText: 1 },
    { unique: true }
);

module.exports = mongoose.model("Highlight", highlightSchema);
