
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";

import api from "../services/api";
import NewsCard from "../components/NewsCard";

export default function PersonalizedFeed() {
    const { profileId } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [articles, setArticles] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadFeed = async () => {
        try {
            setLoading(true);
            setError("");

            const [feedResponse, bookmarkResponse] = await Promise.all([
                api.get(`/news/personalized/${profileId}`, {
                    params: { limit: 30 }
                }),
                api.get("/bookmarks")
            ]);

            const feedData = feedResponse.data;
            const bookmarkData = bookmarkResponse.data;

            setProfile(feedData.profile || null);
            setArticles(feedData.news || []);

            setBookmarks(
                Array.isArray(bookmarkData)
                    ? bookmarkData
                    : bookmarkData.bookmarks || bookmarkData.data || []
            );
        } catch (err) {
            console.error("Personalized feed error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load this personalized feed."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed();
    }, [profileId]);

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
            console.error("Bookmark error:", err);
            alert("Unable to update bookmark.");
        }
    };

    return (
        <main className="dashboard-page personalized-page">
            <button
                className="back-button"
                onClick={() => navigate("/profiles")}
            >
                <ArrowLeft size={16} />
                Back to profiles
            </button>

            <section className="personalized-banner">
                <div>
                    <span className="eyebrow">
                        <Sparkles size={12} />
                        YOUR PERSONALIZED SPACE
                    </span>

                    <h1>
                        {profile?.name || "Your personalized feed"}
                    </h1>

                    <p>
                        {profile?.description ||
                            "Stories selected using your interests and preferences."}
                    </p>
                </div>

                <div className="personalized-symbol">
                    <Sparkles size={29} />
                </div>
            </section>

            {profile && (
                <section className="profile-interests">
                    <div>
                        <span className="interest-label">YOUR TOPICS</span>

                        <div className="interest-tags">
                            {(profile.topics || []).map(topic => (
                                <span key={topic}>{topic}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="interest-label">CATEGORIES</span>

                        <div className="interest-tags">
                            {(profile.categories || []).map(category => (
                                <span key={category}>{category}</span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="news-section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            CURATED AROUND YOUR INTERESTS
                        </span>
                        <h2>Recommended stories</h2>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadFeed}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="dashboard-message">
                        Finding stories that match your interests...
                    </div>
                ) : error ? (
                    <div className="dashboard-message error-message">
                        {error}
                        <button onClick={loadFeed}>Try again</button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="dashboard-message personalized-empty">
                        <Sparkles size={30} />
                        <h3>No matching stories yet</h3>
                        <p>
                            Your feed will show articles matching your topics
                            and categories as relevant news becomes available.
                        </p>
                        <button onClick={() => navigate("/profiles")}>
                            Edit profile interests
                        </button>
                    </div>
                ) : (
                    <>

                        <div className="news-grid">
                            {articles.map(article => {
                                const score = article.recommendationScore || 0;

                                const matchLabel =
                                    score >= 10
                                        ? "Strong match"
                                        : score >= 5
                                            ? "Good match"
                                            : "Related to your interests";

                                return (
                                    <div className="recommended-article" key={article._id}>
                                        <div className="recommendation-info">
                                            <span className="recommendation-label">
                                                <Sparkles size={13} />
                                                {matchLabel}
                                            </span>

                                            {article.matchedTopics?.length > 0 && (
                                                <div className="matched-topics">
                                                    {article.matchedTopics.map(topic => (
                                                        <span key={topic}>{topic}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <NewsCard
                                            article={article}
                                            isBookmarked={bookmarkedIds.includes(article._id)}
                                            onToggleBookmark={toggleBookmark}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
