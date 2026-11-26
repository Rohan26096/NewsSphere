
import { useEffect, useState } from "react";
import {
    Bookmark as BookmarkIcon,
    ExternalLink,
    Trash2
} from "lucide-react";

import Header from "../components/Header";
import api from "../services/api";

export default function Bookmarks() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const { data } = await api.get("/bookmarks");
            setItems(data.bookmarks || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not load bookmarks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const remove = async (id) => {
        try {
            await api.delete(`/bookmarks/${id}`);

            setItems((old) =>
                old.filter((item) => item._id !== id)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not remove bookmark."
            );
        }
    };

    return (
        <main className="page">
            <Header title="Your saved stories" />

            <div className="page-intro">
                <span className="eyebrow">READ LATER</span>
                <h1>Bookmarks</h1>
                <p>Articles and topics you've saved.</p>
            </div>

            {error && <p className="page-error">{error}</p>}

            {loading ? (
                <div className="news-state">
                    <p>Loading bookmarks...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="news-state">
                    <BookmarkIcon size={32} />
                    <h3>No bookmarks yet</h3>
                    <p>
                        Save an article from your news feed and it will appear here.
                    </p>
                </div>
            ) : (
                <div className="bookmark-list">
                    {items.map((item) =>
                        item.type === "article" && item.article ? (
                            <article
                                className="bookmark-row"
                                key={item._id}
                            >
                                {item.article.image && (
                                    <img
                                        src={item.article.image}
                                        alt=""
                                    />
                                )}

                                <div className="bookmark-details">
                                    <span className="eyebrow">
                                        {item.article.source?.name ||
                                            "News Source"}
                                    </span>

                                    <h3>{item.article.title}</h3>

                                    <p>{item.article.description}</p>

                                    <a
                                        href={item.article.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Read article
                                        <ExternalLink size={14} />
                                    </a>
                                </div>

                                <button
                                    className="icon-button"
                                    onClick={() => remove(item._id)}
                                    aria-label="Remove bookmark"
                                >
                                    <Trash2 size={17} />
                                </button>
                            </article>
                        ) : (
                            <article
                                className="bookmark-row topic-bookmark"
                                key={item._id}
                            >
                                <div className="bookmark-details">
                                    <span className="eyebrow">
                                        SAVED TOPIC
                                    </span>
                                    <h3>{item.topic}</h3>
                                </div>

                                <button
                                    className="icon-button"
                                    onClick={() => remove(item._id)}
                                >
                                    <Trash2 size={17} />
                                </button>
                            </article>
                        )
                    )}
                </div>
            )}
        </main>
    );
}
