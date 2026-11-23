
const fetchTopHeadlines = async (category = "general") => {
    try {
        const allowedCategories = [
            "general",
            "world",
            "nation",
            "business",
            "technology",
            "entertainment",
            "sports",
            "science",
            "health"
        ];

        if (!allowedCategories.includes(category)) {
            throw new Error("Invalid news category");
        }

        const params = new URLSearchParams({
            category,
            lang: "en",
            country: "in",
            max: "10"
        });

        const response = await fetch(
            `https://gnews.io/api/v4/top-headlines?${params}`,
            {
                headers: {
                    "X-Api-Key": process.env.GNEWS_API_KEY
                },
                signal: AbortSignal.timeout(15000)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.errors?.[0] || `GNews error: ${response.status}`
            );
        }

        return data.articles || [];

    } catch (error) {
        console.error("GNews API Error:", error.message);
        throw error;
    }
};

module.exports = { fetchTopHeadlines };
