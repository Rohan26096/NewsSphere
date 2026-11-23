
const UserProfile = require("../models/UserProfile");
const News = require("../models/News");

const getPersonalizedFeed = async (req, res) => {
    try {
        const { profileId } = req.params;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

        // Find a profile belonging to the logged-in user
        const profile = await UserProfile.findOne({
            _id: profileId,
            user: req.userId
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        const topics = profile.topics
            .map(topic => topic.trim())
            .filter(Boolean);

        const categories = profile.categories
            .map(category => category.trim())
            .filter(Boolean);

        const conditions = [];

        if (topics.length) {
            conditions.push(
                { topics: { $in: topics } },
                {
                    title: {
                        $in: topics.map(topic => new RegExp(
                            topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                        ))
                    }
                },
                {
                    description: {
                        $in: topics.map(topic => new RegExp(
                            topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                        ))
                    }
                }
            );
        }

        if (categories.length) {
            conditions.push({
                category: { $in: categories }
            });
        }

        const filter = conditions.length
            ? { $or: conditions }
            : { _id: null };

        const news = await News.find(filter)
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await News.countDocuments(filter);

        res.status(200).json({
            success: true,
            profile: {
                id: profile._id,
                name: profile.name,
                topics: profile.topics,
                categories: profile.categories
            },
            total,
            page,
            totalPages: Math.ceil(total / limit),
            news
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getPersonalizedFeed };
