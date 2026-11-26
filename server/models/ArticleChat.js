
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const articleChatSchema = new mongoose.Schema(
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
        messages: {
            type: [messageSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

articleChatSchema.index(
    { user: 1, article: 1 },
    { unique: true }
);

module.exports = mongoose.model("ArticleChat", articleChatSchema);
