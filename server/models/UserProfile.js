
const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        topics: {
            type: [String],
            required: true,
            validate: {
                validator: topics => topics.length > 0,
                message: "Add at least one topic"
            }
        },

        categories: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

userProfileSchema.index(
    { user: 1, name: 1 },
    { unique: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
