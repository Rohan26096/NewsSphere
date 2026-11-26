import { useEffect, useMemo, useState } from "react";
import { Search, TrendingUp, RefreshCw } from "lucide-react";
import api from "../services/api";
import NewsCard from "../components/NewsCard";

const categories = [
  "All",
  "Technology",
  "Business",
  "Politics",
  "Science",
  "Sports",
  "Entertainment",
];

function getArticles(response) {
  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.news)) return data.news;
  if (Array.isArray(data.articles)) return data.articles;
  if (Array.isArray(data.data)) return data.data;

  return [];
}

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { limit: 30 };

      if (activeCategory !== "All") {
        params.category = activeCategory.toLowerCase();
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get("/news", { params });
      setArticles(getArticles(response));
    } catch (err) {
      console.error("News fetch error:", err);
      setError("Unable to load news. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await api.get("/bookmarks");
      const data = response.data;

      setBookmarks(
        Array.isArray(data)
          ? data
          : data.bookmarks || data.data || []
      );
    } catch (err) {
      console.error("Bookmark fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchBookmarks();
  }, [activeCategory]);

  const bookmarkedIds = useMemo(
    () =>
      bookmarks
        .filter((item) => item.type === "article" && item.article)
        .map((item) =>
          typeof item.article === "string"
            ? item.article
            : item.article._id
        ),
    [bookmarks]
  );

  const toggleBookmark = async (articleId) => {
    const existing = bookmarks.find(
      (item) =>
        item.type === "article" &&
        (item.article?._id || item.article) === articleId
    );

    try {
      if (existing) {
        await api.delete(`/bookmarks/${existing._id}`);
        setBookmarks((prev) =>
          prev.filter((item) => item._id !== existing._id)
        );
      } else {
        const response = await api.post("/bookmarks", {
          type: "article",
          articleId,
        });

        const newBookmark = response.data.bookmark || response.data;
        setBookmarks((prev) => [...prev, newBookmark]);
      }
    } catch (err) {
      console.error("Bookmark update error:", err);
      alert("Could not update bookmark. Please try again.");
    }
  };

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">YOUR DAILY NEWS BRIEFING</span>
          <h1>Stay informed. <span>Stay ahead.</span></h1>
          <p>
            The latest stories from around the world, selected for your interests.
          </p>
        </div>

        <div className="welcome-icon">
          <TrendingUp size={28} />
        </div>
      </section>

      <section className="dashboard-search">
        <Search size={19} />
        <input
          type="text"
          placeholder="Search articles, topics or sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchNews();
          }}
        />
        <button onClick={fetchNews}>Search</button>
      </section>

      <section className="category-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPLORE</span>
            <h2>Browse categories</h2>
          </div>
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={
                activeCategory === category
                  ? "category-chip active"
                  : "category-chip"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="news-section">
        <div className="section-heading news-heading">
          <div>
            <span className="eyebrow">WHAT'S HAPPENING</span>
            <h2>{activeCategory === "All" ? "Latest stories" : activeCategory}</h2>
          </div>

          <button className="refresh-button" onClick={fetchNews}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="dashboard-message">Loading the latest stories...</div>
        ) : error ? (
          <div className="dashboard-message error-message">
            {error}
            <button onClick={fetchNews}>Try again</button>
          </div>
        ) : articles.length === 0 ? (
          <div className="dashboard-message">
            No articles found. Try another category or search term.
          </div>
        ) : (
          <>
            {featuredArticle && (
              <div className="featured-section">
                <NewsCard
                  article={featuredArticle}
                  featured
                  isBookmarked={bookmarkedIds.includes(featuredArticle._id)}
                  onToggleBookmark={toggleBookmark}
                />
              </div>
            )}

            <div className="news-grid">
              {remainingArticles.map((article) => (
                <NewsCard
                  key={article._id}
                  article={article}
                  isBookmarked={bookmarkedIds.includes(article._id)}
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