
import { useState } from "react";
import { Bookmark, ExternalLink } from "lucide-react";

function NewsCard({
    article,
    isBookmarked = false,
    onToggleBookmark
}) {
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    const formattedDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
          })
        : "Recently published";

    const handleBookmark = async () => {
        if (bookmarkLoading || !onToggleBookmark) return;

        setBookmarkLoading(true);

        try {
            await onToggleBookmark(article._id);
        } finally {
            setBookmarkLoading(false);
        }
    };

    return (
        <article className="news-card">
            <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-image-wrapper"
                aria-label={`Read ${article.title}`}
            >
                {article.image ? (
                    <img
                        src={article.image}
                        alt={article.title}
                        className="news-image"
                        loading="lazy"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="news-image-placeholder">
                        <span>NewsSphere</span>
                    </div>
                )}
            </a>

            <div className="news-card-content">
                <div className="news-meta">
                    <span className="news-source">
                        {article.source?.name || "News Source"}
                    </span>

                    <span className="news-date">
                        {formattedDate}
                    </span>
                </div>

                <h3>{article.title}</h3>

                <p className="news-description">
                    {article.description ||
                        "Read the full article for more details."}
                </p>

                <div className="news-card-footer">
                    <button
                        type="button"
                        className={`news-action-btn ${
                            isBookmarked ? "bookmarked" : ""
                        }`}
                        onClick={handleBookmark}
                        disabled={bookmarkLoading}
                        aria-label={
                            isBookmarked
                                ? "Remove bookmark"
                                : "Bookmark article"
                        }
                        aria-pressed={isBookmarked}
                        title={
                            isBookmarked
                                ? "Remove bookmark"
                                : "Save article"
                        }
                    >
                        <Bookmark
                            size={18}
                            fill={isBookmarked ? "currentColor" : "none"}
                        />
                    </button>

                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-action-btn"
                        aria-label="Read full article"
                        title="Read full article"
                    >
                        <ExternalLink size={18} />
                    </a>
                </div>
            </div>
        </article>
    );
}

export default NewsCard;
