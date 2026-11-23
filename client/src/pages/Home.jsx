
import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

import Header from "../components/Header";
import NewsCard from "../components/NewsCard";
import api from "../services/api";

function Home({ onCreateProfile }) {
    const [news, setNews] = useState([]);
    const [bookmarks, setBookmarks] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch news
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/news", {
                    params: {
                        search: searchQuery.trim(),
                        limit: 30
                    }
                });

                setNews(response.data.news || []);
            } catch (err) {
                console.error("News fetching failed:", err);
                setError(
                    "Unable to load news. Please check your backend connection."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [searchQuery]);

    // Fetch user's bookmarks
    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const response = await api.get("/bookmarks");

                const bookmarkMap = {};

                (response.data.bookmarks || []).forEach((bookmark) => {
                    if (bookmark.article?._id) {
                        bookmarkMap[bookmark.article._id] = bookmark._id;
                    }
                });

                setBookmarks(bookmarkMap);
            } catch (err) {
                console.error("Bookmark fetching failed:", err);
            }
        };

        fetchBookmarks();
    }, []);

    // Add or remove a bookmark
    const handleToggleBookmark = async (articleId) => {
        const existingBookmarkId = bookmarks[articleId];

        try {
            if (existingBookmarkId) {
                await api.delete(`/bookmarks/${existingBookmarkId}`);

                setBookmarks((previous) => {
                    const updated = { ...previous };
                    delete updated[articleId];
                    return updated;
                });
            } else {
                const response = await api.post("/bookmarks", {
                    type: "article",
                    articleId
                });

                const newBookmarkId = response.data.bookmark._id;

                setBookmarks((previous) => ({
                    ...previous,
                    [articleId]: newBookmarkId
                }));
            }

            return true;
        } catch (err) {
            console.error("Bookmark update failed:", err);
            return false;
        }
    };

    return (
        <main className="home-page">
            <Header
                onCreateProfile={onCreateProfile}
                onSearch={setSearchQuery}
            />

            <section className="welcome-banner">
                <span className="eyebrow">YOUR DAILY NEWS</span>
                <h1>Stay informed. Stay ahead.</h1>
                <p>
                    Your world of news, organized around what matters to you.
                </p>
            </section>

            <section className="latest-news-section">
                <div className="section-heading">
                    <div>
                        <h2>Latest News</h2>
                        <p>Discover what's happening around the world.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="news-state">
                        <p>Loading latest news...</p>
                    </div>
                ) : error ? (
                    <div className="news-state">
                        <Newspaper size={32} />
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="news-state">
                        <Newspaper size={32} />
                        <h3>No news found</h3>
                        <p>
                            Try another search or check back later for new articles.
                        </p>
                    </div>
                ) : (
                    <div className="news-grid">
                        {news.map((article) => (
                            <NewsCard
                                key={article._id}
                                article={article}
                                isBookmarked={Boolean(bookmarks[article._id])}
                                onToggleBookmark={handleToggleBookmark}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Home;
