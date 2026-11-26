
import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import api from "../services/api";
import NewsCard from "../components/NewsCard";

const categories = [
    "All",
    "World",
    "Business",
    "Technology",
    "Nation",
    "Science",
    "Sports",
    "Entertainment"
];

export default function EditionNews({ edition }) {
    const isIndia = edition === "india";

    const [articles, setArticles] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNews = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                edition,
                limit: 30
            };

            if (category !== "All") {
                params.category = category.toLowerCase();
            }

            const response = await api.get("/news", { params });

            setArticles(response.data.news || []);
        } catch (err) {
            console.error("Edition news error:", err);
            setError("Unable to load news. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarks = async () => {
        try {
            const response = await api.get("/bookmarks");
            const data = response.data;

            setBookmarks(
                Array.isArray(data)
                    ? data
                    : data.bookmarks || data.data || []
            );
        } catch (err) {
            console.error("Bookmark error:", err);
        }
    };

    useEffect(() => {
        loadNews();
        loadBookmarks();
    }, [edition, category]);

    const bookmarkedIds = useMemo(
        () =>
            bookmarks
                .filter(item => item.type === "article" && item.article)
                .map(item =>
                    typeof item.article === "string"
                        ? item.article
                        : item.article._id
                ),
        [bookmarks]
    );

    const toggleBookmark = async (articleId) => {
        const existing = bookmarks.find(
            item =>
                item.type === "article" &&
                (item.article?._id || item.article) === articleId
        );

        try {
            if (existing) {
                await api.delete(`/bookmarks/${existing._id}`);

                setBookmarks(prev =>
                    prev.filter(item => item._id !== existing._id)
                );
            } else {
                const response = await api.post("/bookmarks", {
                    type: "article",
                    articleId
                });

                const newBookmark =
                    response.data.bookmark || response.data;

                setBookmarks(prev => [...prev, newBookmark]);
            }
        } catch (err) {
            console.error("Bookmark update error:", err);
            alert("Unable to update bookmark.");
        }
    };

    const featuredArticle = articles[0];
    const remainingArticles = articles.slice(1);

    return (
        <main className="dashboard-page edition-page">
            <section className={`edition-banner ${edition}`}>
                <div>
                    <span className="eyebrow">
                        {isIndia ? "INDIAN EDITION" : "INTERNATIONAL EDITION"}
                    </span>

                    <h1>
                        {isIndia ? "India News" : "Global News"}
                        <span>{isIndia ? " 🇮🇳" : " 🌍"}</span>
                    </h1>

                    <p>
                        {isIndia
                            ? "Stay updated with the latest stories from across India."
                            : "Explore important stories and developments from around the world."}
                    </p>
                </div>

                <div className="edition-symbol">
                    {isIndia ? "IN" : "GL"}
                </div>
            </section>

            <section className="category-section edition-categories">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">EXPLORE</span>
                        <h2>Browse topics</h2>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadNews}
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>

                <div className="category-list">
                    {categories.map(item => (
                        <button
                            key={item}
                            className={
                                category === item
                                    ? "category-chip active"
                                    : "category-chip"
                            }
                            onClick={() => setCategory(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </section>

            <section className="news-section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            {isIndia ? "ACROSS INDIA" : "AROUND THE WORLD"}
                        </span>
                        <h2>Latest stories</h2>
                    </div>
                </div>

                {loading ? (
                    <div className="dashboard-message">
                        Loading the latest stories...
                    </div>
                ) : error ? (
                    <div className="dashboard-message error-message">
                        {error}
                        <button onClick={loadNews}>Try again</button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="dashboard-message">
                        <h3>No stories available yet</h3>
                        <p style={{ marginTop: "10px" }}>
                            Sync the {isIndia ? "India" : "Global"} news edition
                            from your backend to populate this section.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="featured-section">
                            <NewsCard
                                article={featuredArticle}
                                featured
                                isBookmarked={bookmarkedIds.includes(
                                    featuredArticle._id
                                )}
                                onToggleBookmark={toggleBookmark}
                            />
                        </div>

                        <div className="news-grid">
                            {remainingArticles.map(article => (
                                <NewsCard
                                    key={article._id}
                                    article={article}
                                    isBookmarked={bookmarkedIds.includes(
                                        article._id
                                    )}
                                    onToggleBookmark={toggleBookmark}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
