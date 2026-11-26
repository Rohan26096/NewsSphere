
const fetchTopHeadlines = async (
    category = "general",
    edition = "india"
) => {
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

        if (!["india", "global"].includes(edition)) {
            throw new Error("Invalid news edition");
        }

        const params = new URLSearchParams({
            category,
            lang: "en",
            max: "10"
        });

        // India edition is restricted to Indian headlines.
        // Global edition intentionally has no country restriction.
        if (edition === "india") {
            params.set("country", "in");
        }

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
