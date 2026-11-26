
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Bookmark,
    ExternalLink,
    Highlighter,
    Save,
    X,
    Sun,
    Moon,
    Minus,
    Plus,
    Copy,
    Clock,
    Sparkles,
    RefreshCw,
    ChevronDown,
    Send,
    MessageCircle,
} from "lucide-react";

import api from "../services/api";
import ReactMarkdown from "react-markdown";

export default function ArticleReader() {
    const { articleId } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedText, setSelectedText] = useState("");
    const [note, setNote] = useState("");
    const [showHighlightForm, setShowHighlightForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Reading preferences
    const [fontSize, setFontSize] = useState("medium");
    const [theme, setTheme] = useState("dark");
    const [readingProgress, setReadingProgress] = useState(0);
    const [copyMessage, setCopyMessage] = useState("");

    // AI Article Insights
    const [aiInsights, setAiInsights] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [showInsights, setShowInsights] = useState(true);
    const [insightsCached, setInsightsCached] = useState(false);

    // AI Article Chat
    const [chatMessages, setChatMessages] = useState([]);
    const [chatQuestion, setChatQuestion] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState("");

    const [chatHistoryLoading, setChatHistoryLoading] = useState(true);
    useEffect(() => {
        const loadArticle = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/news/${articleId}`);

                setArticle(
                    response.data.news || response.data.article || response.data
                );
            } catch (err) {
                console.error("Article loading error:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load this article."
                );
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [articleId]);
    // Load saved AI chat history for the current article
    useEffect(() => {
        let cancelled = false;

        const loadChatHistory = async () => {
            try {
                setChatHistoryLoading(true);
                setChatMessages([]);
                setChatError("");

                const response = await api.get(`/ai/chat/${articleId}`);

                if (!cancelled) {
                    setChatMessages(response.data.messages || []);
                }
            } catch (err) {
                console.error("Chat history loading error:", err);

                if (!cancelled) {
                    setChatError(
                        "Unable to load previous conversation."
                    );
                }
            } finally {
                if (!cancelled) {
                    setChatHistoryLoading(false);
                }
            }
        };

        loadChatHistory();

        return () => {
            cancelled = true;
        };
    }, [articleId]);

    // Reading progress
    useEffect(() => {
        const updateProgress = () => {
            const reader = document.querySelector(".article-reader");

            if (!reader) return;

            const readerTop = reader.getBoundingClientRect().top + window.scrollY;
            const readerHeight = reader.offsetHeight;
            const scrollableDistance =
                readerHeight - window.innerHeight;

            if (scrollableDistance <= 0) {
                setReadingProgress(100);
                return;
            }

            const progress =
                ((window.scrollY - readerTop) / scrollableDistance) * 100;

            setReadingProgress(
                Math.min(100, Math.max(0, Math.round(progress)))
            );
        };

        window.addEventListener("scroll", updateProgress);
        window.addEventListener("resize", updateProgress);
        updateProgress();

        return () => {
            window.removeEventListener("scroll", updateProgress);
            window.removeEventListener("resize", updateProgress);
        };
    }, [article]);

    const generateInsights = async (forceRefresh = false) => {
        try {
            setAiLoading(true);
            setAiError("");
            setShowInsights(true);

            const response = await api.post("/ai/insights", {
                articleId,
                forceRefresh
            });

            setAiInsights(response.data.insights);
            setInsightsCached(response.data.cached);

        } catch (err) {
            console.error("AI insights error:", err);

            setAiError(
                err.response?.data?.message ||
                "Unable to generate insights. Please try again."
            );
        } finally {
            setAiLoading(false);
        }
    };

    const handleAskQuestion = async (e, suggestedQuestion = "") => {
        e?.preventDefault();

        const question = (suggestedQuestion || chatQuestion).trim();

        if (!question || chatLoading || chatHistoryLoading) return;

        const updatedMessages = [
            ...chatMessages,
            { role: "user", content: question }
        ];

        setChatMessages(updatedMessages);
        setChatQuestion("");
        setChatLoading(true);
        setChatError("");

        try {
            const response = await api.post("/ai/chat", {
                articleId,
                question,
                history: chatMessages.slice(-10)
            });

            setChatMessages([
                ...updatedMessages,
                {
                    role: "assistant",
                    content: response.data.answer
                }
            ]);
        } catch (err) {
            console.error("AI chat error:", err);

            setChatError(
                err.response?.data?.message ||
                "Unable to get an answer. Please try again."
            );
        } finally {
            setChatLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (chatLoading) return;

        const confirmed = window.confirm(
            "Are you sure you want to clear this conversation?"
        );

        if (!confirmed) return;

        try {
            setChatError("");

            await api.delete(`/ai/chat/${articleId}`);

            setChatMessages([]);
            setChatQuestion("");
        } catch (err) {
            console.error("Clear chat error:", err);

            setChatError(
                err.response?.data?.message ||
                "Unable to clear conversation. Please try again."
            );
        }
    };
    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (!text) return;

        const reader = document.querySelector(".article-content");

        if (!reader || !reader.contains(selection.anchorNode)) {
            return;
        }

        setSelectedText(text);
        setNote("");
        setShowHighlightForm(true);
        setMessage("");
        setCopyMessage("");
    };

    const saveHighlight = async (e) => {
        e.preventDefault();

        if (!selectedText.trim()) return;

        try {
            setSaving(true);
            setMessage("");

            await api.post("/highlights", {
                articleId,
                selectedText,
                note
            });

            setMessage("Highlight saved successfully.");
            setSelectedText("");
            setNote("");
            setShowHighlightForm(false);
            window.getSelection()?.removeAllRanges();
        } catch (err) {
            setMessage(
                err.response?.data?.message ||
                "Unable to save highlight."
            );
        } finally {
            setSaving(false);
        }
    };

    const copySelectedText = async () => {
        try {
            await navigator.clipboard.writeText(selectedText);
            setCopyMessage("Text copied!");
        } catch (err) {
            setCopyMessage("Unable to copy text.");
        }
    };

    const changeFontSize = (direction) => {
        const sizes = ["small", "medium", "large"];
        const currentIndex = sizes.indexOf(fontSize);

        const nextIndex = Math.min(
            sizes.length - 1,
            Math.max(0, currentIndex + direction)
        );

        setFontSize(sizes[nextIndex]);
    };

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-message">
                    Loading article...
                </div>
            </main>
        );
    }

    if (error || !article) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-message">
                    {error || "Article not found."}
                    <button onClick={() => navigate(-1)}>
                        Go back
                    </button>
                </div>
            </main>
        );
    }

    const publishedDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
        : "Recently published";

    const articleText = [
        article.title,
        article.description,
        article.content
    ].filter(Boolean).join(" ");

    const wordCount = articleText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <main className={`dashboard-page article-reader-page theme-${theme}`}>
            <div className="reading-progress-track">
                <div
                    className="reading-progress-fill"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            <button
                className="back-button"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={16} />
                Back to news
            </button>

            <article className={`article-reader font-${fontSize}`}>
                <div className="article-top-meta">
                    <span className="article-category">
                        {article.category || "News"}
                    </span>
                    <span>{article.source?.name || "NewsSphere"}</span>
                    <span>{publishedDate}</span>
                </div>

                <h1>{article.title}</h1>

                <div className="article-reading-time">
                    <Clock size={15} />
                    {readingTime} min read
                    <span>•</span>
                    {wordCount.toLocaleString("en-IN")} words
                </div>

                {article.description && (
                    <p className="article-description">
                        {article.description}
                    </p>
                )}

                {article.image && (
                    <img
                        className="article-hero-image"
                        src={article.image}
                        alt={article.title}
                    />
                )}

                <div className="article-reader-toolbar">
                    <div className="reader-toolbar-left">
                        <span className="highlight-instruction">
                            <Highlighter size={15} />
                            Select text to save a highlight
                        </span>

                        <div className="reader-control-group">
                            <button
                                type="button"
                                onClick={() => changeFontSize(-1)}
                                disabled={fontSize === "small"}
                                title="Decrease font size"
                            >
                                <Minus size={15} />
                            </button>

                            <span>Font</span>

                            <button
                                type="button"
                                onClick={() => changeFontSize(1)}
                                disabled={fontSize === "large"}
                                title="Increase font size"
                            >
                                <Plus size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="reader-toolbar-right">
                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={() =>
                                setTheme(theme === "dark" ? "light" : "dark")
                            }
                            title="Toggle reading theme"
                        >
                            {theme === "dark" ? (
                                <Sun size={16} />
                            ) : (
                                <Moon size={16} />
                            )}
                            {theme === "dark" ? "Light" : "Dark"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/highlights")}
                        >
                            <Bookmark size={15} />
                            My Highlights
                        </button>
                    </div>
                </div>

                {/* AI Article Insights */}
                <section className="ai-insights-section">
                    <div className="ai-insights-header">
                        <div className="ai-insights-heading">
                            <div className="ai-insights-icon">
                                <Sparkles size={19} />
                            </div>

                            <div>
                                <h2>AI Article Insights</h2>
                                <p>Understand the story beyond the headlines</p>
                            </div>
                        </div>

                        {aiInsights && (
                            <button
                                className="ai-collapse-button"
                                onClick={() => setShowInsights(!showInsights)}
                                type="button"
                            >
                                {showInsights ? "Collapse" : "Expand"}
                                <ChevronDown
                                    size={16}
                                    className={showInsights ? "rotated" : ""}
                                />
                            </button>
                        )}
                    </div>

                    {!aiInsights && !aiLoading && (
                        <div className="ai-generate-area">
                            <p>
                                Get an AI-generated summary, key takeaways,
                                important entities and context for this article.
                            </p>

                            <button
                                className="ai-generate-button"
                                onClick={() => generateInsights(false)}
                                type="button"
                            >
                                <Sparkles size={17} />
                                Generate AI Insights
                            </button>
                        </div>
                    )}

                    {aiLoading && (
                        <div className="ai-loading">
                            <div className="ai-loading-spinner" />
                            <div>
                                <strong>Analyzing this article...</strong>
                                <p>Gemini is preparing your insights.</p>
                            </div>
                        </div>
                    )}

                    {aiError && (
                        <div className="ai-error">
                            <p>{aiError}</p>

                            <button
                                type="button"
                                onClick={() => generateInsights(true)}
                                disabled={aiLoading}
                            >
                                <RefreshCw size={15} />
                                Try again
                            </button>
                        </div>
                    )}

                    {aiInsights && showInsights && (
                        <div className="ai-insights-content">

                            <div className="ai-insight-block">
                                <h3>Quick Summary</h3>

                                <ul>
                                    {aiInsights.summary?.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="ai-insight-block">
                                <h3>Key Takeaways</h3>

                                <ul>
                                    {aiInsights.keyTakeaways?.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="ai-insight-block">
                                <h3>Why It Matters</h3>
                                <p>{aiInsights.whyItMatters}</p>
                            </div>

                            <div className="ai-insight-block">
                                <h3>Important Entities</h3>

                                <div className="ai-entity-list">
                                    {aiInsights.entities?.map((entity, index) => (
                                        <span key={index}>{entity}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="ai-insight-block">
                                <h3>Context</h3>
                                <p>{aiInsights.context}</p>
                            </div>

                            <div className="ai-insights-footer">
                                <span>
                                    <Sparkles size={13} />
                                    {insightsCached
                                        ? "Loaded from saved insights"
                                        : "Generated by NewsSphere AI"}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => generateInsights(true)}
                                    disabled={aiLoading}
                                >
                                    <RefreshCw size={14} />
                                    Regenerate
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* AI Article Chat */}
                <section className="ai-chat-section">

                    <div className="ai-chat-header">
                        <div className="ai-chat-title">
                            <div className="ai-insights-icon">
                                <MessageCircle size={19} />
                            </div>

                            <div>
                                <h2>Chat with this Article</h2>
                                <p>Ask questions and explore the story in detail</p>
                            </div>
                        </div>

                        {chatMessages.length > 0 && (
                            <button
                                type="button"
                                className="ai-chat-clear"
                                onClick={handleClearChat}
                                disabled={chatLoading}
                            >
                                Clear chat
                            </button>
                        )}
                    </div>


                    <div className="ai-chat-suggestions">
                        <span className="ai-chat-suggestions-label">
                            Suggested questions
                        </span>

                        <div className="ai-chat-suggestion-list">
                            {[
                                "Explain this article in simple words.",
                                "What are the key takeaways?",
                                "Why does this story matter?",
                                "What could happen next?",
                                "What important context am I missing?"
                            ].map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="ai-chat-suggestion"
                                    onClick={() => handleAskQuestion(null, suggestion)}
                                    disabled={chatLoading || chatHistoryLoading}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>


                    {chatError && (
                        <p className="ai-chat-error">{chatError}</p>
                    )}

                    <form
                        className="ai-chat-form"
                        onSubmit={handleAskQuestion}
                    >
                        <input
                            type="text"
                            value={chatQuestion}
                            onChange={(e) => setChatQuestion(e.target.value)}
                            placeholder="Ask something about this article..."
                            disabled={chatLoading}
                        />

                        <button
                            type="submit"
                            disabled={
                                chatLoading ||
                                chatHistoryLoading ||
                                !chatQuestion.trim()
                            }                        >
                            <Send size={17} />
                            Send
                        </button>
                    </form>

                </section>

                {message && (
                    <div className="article-feedback">
                        {message}
                    </div>
                )}

                <div
                    className="article-content"
                    onMouseUp={handleTextSelection}
                    onTouchEnd={handleTextSelection}
                >
                    {(article.content || article.description || "")
                        .split(/\n+/)
                        .filter(Boolean)
                        .map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                </div>

                <div className="article-source-link">
                    <span>
                        Originally published by{" "}
                        {article.source?.name || "the publisher"}
                    </span>

                    {article.url && (
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Read original article
                            <ExternalLink size={15} />
                        </a>
                    )}
                </div>
            </article>

            {showHighlightForm && (
                <div className="modal-backdrop">
                    <section className="modal-panel highlight-modal">
                        <div className="modal-heading">
                            <h2>Save highlight</h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowHighlightForm(false);
                                    setSelectedText("");
                                    setCopyMessage("");
                                    window.getSelection()?.removeAllRanges();
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            className="profile-form"
                            onSubmit={saveHighlight}
                        >
                            <label>
                                Selected text

                                <textarea
                                    value={selectedText}
                                    readOnly
                                    rows={4}
                                />
                            </label>

                            <button
                                type="button"
                                className="copy-selected-button"
                                onClick={copySelectedText}
                            >
                                <Copy size={15} />
                                Copy selected text
                            </button>

                            {copyMessage && (
                                <small className="copy-feedback">
                                    {copyMessage}
                                </small>
                            )}

                            <label>
                                Personal note
                                <small>
                                    Optional. Add your thoughts or explanation.
                                </small>

                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Write your notes here..."
                                    rows={4}
                                />
                            </label>

                            <button
                                className="primary-button"
                                disabled={saving}
                            >
                                <Save size={16} />
                                {saving ? "Saving..." : "Save highlight"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
