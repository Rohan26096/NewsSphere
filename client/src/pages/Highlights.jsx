
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bookmark,
    ExternalLink,
    FileText,
    Pencil,
    Trash2,
    X,
    Save
} from "lucide-react";

import api from "../services/api";

export default function Highlights() {
    const navigate = useNavigate();

    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    const loadHighlights = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/highlights");

            setHighlights(response.data.highlights || []);
        } catch (err) {
            console.error("Highlights loading error:", err);
            setError("Unable to load your highlights.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHighlights();
    }, []);

    const startEditing = (item) => {
        setEditing(item._id);
        setNote(item.note || "");
    };

    const saveNote = async (id) => {
        try {
            const response = await api.put(`/highlights/${id}`, { note });

            setHighlights(prev =>
                prev.map(item =>
                    item._id === id
                        ? response.data.highlight
                        : item
                )
            );

            setEditing(null);
            setNote("");
        } catch (err) {
            console.error("Note update error:", err);
            alert("Unable to update your note.");
        }
    };

    const deleteHighlight = async (id) => {
        if (!window.confirm("Delete this highlight?")) return;

        try {
            await api.delete(`/highlights/${id}`);

            setHighlights(prev =>
                prev.filter(item => item._id !== id)
            );
        } catch (err) {
            console.error("Highlight delete error:", err);
            alert("Unable to delete highlight.");
        }
    };

    return (
        <main className="dashboard-page highlights-page">
            <section className="page-intro">
                <span className="eyebrow">YOUR READING LIBRARY</span>
                <h1>My Highlights</h1>
                <p>
                    Important passages and personal notes saved from your
                    reading.
                </p>
            </section>

            <div className="highlights-summary">
                <Bookmark size={20} />
                <div>
                    <strong>{highlights.length}</strong>
                    <span>Saved highlights</span>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-message">
                    Loading your highlights...
                </div>
            ) : error ? (
                <div className="dashboard-message error-message">
                    {error}
                    <button onClick={loadHighlights}>Try again</button>
                </div>
            ) : highlights.length === 0 ? (
                <div className="dashboard-message highlights-empty">
                    <FileText size={32} />
                    <h3>No highlights saved yet</h3>
                    <p>
                        Open an article, select an important sentence and
                        save it here.
                    </p>
                    <button onClick={() => navigate("/")}>
                        Explore news
                    </button>
                </div>
            ) : (
                <div className="highlights-list">
                    {highlights.map(item => (
                        <article className="highlight-card" key={item._id}>
                            <div className="highlight-card-header">
                                <span className="eyebrow">
                                    {item.article?.source?.name || "News article"}
                                </span>

                                <div className="highlight-actions">
                                    <button
                                        onClick={() => startEditing(item)}
                                        title="Edit note"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        onClick={() => deleteHighlight(item._id)}
                                        title="Delete highlight"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            <blockquote className="saved-highlight-text">
                                {item.selectedText}
                            </blockquote>

                            {editing === item._id ? (
                                <div className="highlight-note-editor">
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="Add your personal note..."
                                        rows={3}
                                    />

                                    <div>
                                        <button
                                            className="primary-button"
                                            onClick={() => saveNote(item._id)}
                                        >
                                            <Save size={15} />
                                            Save note
                                        </button>

                                        <button
                                            className="cancel-edit-button"
                                            onClick={() => setEditing(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="saved-highlight-note">
                                    <span>MY NOTE</span>
                                    <p>
                                        {item.note || "No personal note added."}
                                    </p>
                                </div>
                            )}

                            <div className="highlight-card-footer">
                                <span>
                                    {new Date(item.createdAt).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        }
                                    )}
                                </span>

                                {item.article?.url && (
                                    <a
                                        href={item.article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Original article
                                        <ExternalLink size={13} />
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
