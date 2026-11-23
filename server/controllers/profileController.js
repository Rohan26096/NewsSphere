
const UserProfile = require("../models/UserProfile");

// Helper: clean and validate arrays of strings
const cleanStringArray = (items) => {
    if (!Array.isArray(items)) return null;

    return [...new Set(
        items
            .filter(item => typeof item === "string")
            .map(item => item.trim())
            .filter(Boolean)
    )];
};

// CREATE PROFILE
const createProfile = async (req, res) => {
    try {
        const { name, description = "", topics, categories = [] } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Profile name is required"
            });
        }

        const cleanTopics = cleanStringArray(topics);
        const cleanCategories = cleanStringArray(categories);

        if (!cleanTopics || cleanTopics.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Add at least one valid topic"
            });
        }

        if (!cleanCategories) {
            return res.status(400).json({
                success: false,
                message: "Categories must be an array"
            });
        }

        const profile = await UserProfile.create({
            user: req.userId,
            name: name.trim(),
            description,
            topics: cleanTopics,
            categories: cleanCategories
        });

        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            profile
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A profile with this name already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL USER PROFILES
const getProfiles = async (req, res) => {
    try {
        const profiles = await UserProfile.find({
            user: req.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: profiles.length,
            profiles
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET SINGLE PROFILE
const getProfileById = async (req, res) => {
    try {
        const profile = await UserProfile.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            profile
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid profile ID"
        });
    }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const { name, description, topics, categories } = req.body;

        const updates = {};

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Profile name cannot be empty"
                });
            }

            updates.name = name.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Description must be a string"
                });
            }

            updates.description = description.trim();
        }

        if (topics !== undefined) {
            const cleanTopics = cleanStringArray(topics);

            if (!cleanTopics || cleanTopics.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Add at least one valid topic"
                });
            }

            updates.topics = cleanTopics;
        }

        if (categories !== undefined) {
            const cleanCategories = cleanStringArray(categories);

            if (!cleanCategories) {
                return res.status(400).json({
                    success: false,
                    message: "Categories must be an array"
                });
            }

            updates.categories = cleanCategories;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided to update"
            });
        }

        const profile = await UserProfile.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A profile with this name already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE PROFILE
const deleteProfile = async (req, res) => {
    try {
        const profile = await UserProfile.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid profile ID"
        });
    }
};

module.exports = {
    createProfile,
    getProfiles,
    getProfileById,
    updateProfile,
    deleteProfile
};
