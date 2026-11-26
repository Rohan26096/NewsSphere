
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ArrowUpRight, Clock } from "lucide-react";

export default function NewsCard({
    article,
    featured = false,
    isBookmarked = false,
    onToggleBookmark
}) {
    const [bookmarking, setBookmarking] = useState(false);
    const navigate = useNavigate();

    const publishedDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
        : "Recently published";

    const handleBookmark = async () => {
        if (bookmarking) return;

        setBookmarking(true);

        try {
            await onToggleBookmark(article._id);
        } finally {
            setBookmarking(false);
        }
    };

    return (
        <article className={`news-card ${featured ? "featured-card" : ""}`}>
            <div className="news-image-wrapper">
                {article.image ? (
                    <img
                        src={article.image}
                        alt={article.title}
                        className="news-image"
                        loading="lazy"
                    />
                ) : (
                    <div className="news-image-placeholder">
                        NewsSphere
                    </div>
                )}

                {article.category && (
                    <span className="news-category">
                        {article.category}
                    </span>
                )}

                <button
                    className={`bookmark-button ${isBookmarked ? "bookmarked" : ""}`}
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    aria-label={
                        isBookmarked ? "Remove bookmark" : "Bookmark article"
                    }
                    title={
                        isBookmarked ? "Remove bookmark" : "Save article"
                    }
                >
                    <Bookmark
                        size={18}
                        fill={isBookmarked ? "currentColor" : "none"}
                    />
                </button>
            </div>

            <div className="news-card-content">
                <div className="news-meta">
                    <span>{article.source?.name || "Unknown source"}</span>
                    <span className="meta-dot">•</span>
                    <span>
                        <Clock size={12} />
                        {publishedDate}
                    </span>
                </div>

                <h3>{article.title}</h3>

                <p>
                    {article.description ||
                        "Open this article to read the full story."}
                </p>

                <button
                    className="read-article-link"
                    onClick={() => navigate(`/article/${article._id}`)}
                >
                    Read article
                    <ArrowUpRight size={15} />
                </button>
            </div>
        </article>
    );
}
