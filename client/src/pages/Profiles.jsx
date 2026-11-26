
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import api from "../services/api";

const emptyForm = {
    name: "",
    description: "",
    topics: "",
    categories: ""
};

export default function Profiles() {
    const [profiles, setProfiles] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const navigate = useNavigate();

    const load = async () => {
        try {
            const { data } = await api.get("/profiles");
            setProfiles(data.profiles || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not load profiles."
            );
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setShowForm(true);
    };

    const openEdit = (profile) => {
        setEditingId(profile._id);

        setForm({
            name: profile.name,
            description: profile.description || "",
            topics: profile.topics.join(", "),
            categories: (profile.categories || []).join(", ")
        });

        setError("");
        setShowForm(true);
    };

    const submit = async (e) => {
        e.preventDefault();

        setBusy(true);
        setError("");

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            topics: form.topics
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            categories: form.categories
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
        };

        try {
            if (editingId) {
                await api.put(`/profiles/${editingId}`, payload);
            } else {
                await api.post("/profiles", payload);
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);

            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not save profile."
            );
        } finally {
            setBusy(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this profile?")) return;

        try {
            await api.delete(`/profiles/${id}`);
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not delete profile."
            );
        }
    };

    return (
        <main className="page">
            <Header
                title="Your profiles"
                onCreateProfile={openCreate}
            />

            <div className="page-intro">
                <span className="eyebrow">
                    PERSONALIZE YOUR NEWS
                </span>

                <h1>My Profiles</h1>

                <p>
                    Create your own topics and decide what appears in your personal feed.
                </p>
            </div>

            {error && <p className="page-error">{error}</p>}

            <div className="profile-grid">
                <button
                    className="profile-create-card"
                    onClick={openCreate}
                >
                    <Plus size={24} />
                    <strong>Create a profile</strong>
                    <span>
                        Choose the topics you want to follow.
                    </span>
                </button>

                {profiles.map((profile) => (
                    <article
                        className="profile-card"
                        key={profile._id}
                    >
                        <div className="profile-card-top">
                            <div>
                                <span className="eyebrow">
                                    YOUR PROFILE
                                </span>

                                <h3>{profile.name}</h3>
                            </div>

                            <div className="profile-actions">
                                <button
                                    onClick={() => openEdit(profile)}
                                    aria-label="Edit profile"
                                >
                                    <Pencil size={17} />
                                </button>

                                <button
                                    onClick={() => remove(profile._id)}
                                    aria-label="Delete profile"
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </div>

                        <p>
                            {profile.description ||
                                "A personalized collection of news topics."}
                        </p>

                        <div className="topic-chips">
                            {profile.topics.map((topic) => (
                                <span key={topic}>{topic}</span>
                            ))}
                        </div>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(`/profiles/${profile._id}/feed`)
                            }
                        >
                            Open personalized feed
                        </button>
                    </article>
                ))}
            </div>

            {showForm && (
                <div
                    className="modal-backdrop"
                    onClick={() => setShowForm(false)}
                >
                    <section
                        className="modal-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-heading">
                            <h2>
                                {editingId
                                    ? "Edit profile"
                                    : "Create a profile"}
                            </h2>

                            <button onClick={() => setShowForm(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            className="profile-form"
                        >
                            <label>
                                Profile name
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value
                                        })
                                    }
                                    placeholder="AI & Machine Learning"
                                    required
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value
                                        })
                                    }
                                    placeholder="What do you want this profile to focus on?"
                                    rows={3}
                                />
                            </label>

                            <label>
                                Topics
                                <small>
                                    Separate each topic with a comma
                                </small>

                                <input
                                    value={form.topics}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            topics: e.target.value
                                        })
                                    }
                                    placeholder="Artificial Intelligence, LLMs, Deep Learning"
                                    required
                                />
                            </label>

                            <label>
                                Categories
                                <small>
                                    Optional, e.g. technology, business, science
                                </small>

                                <input
                                    value={form.categories}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            categories: e.target.value
                                        })
                                    }
                                    placeholder="technology, science"
                                />
                            </label>

                            {error && (
                                <p className="form-message">{error}</p>
                            )}

                            <button
                                className="primary-button"
                                disabled={busy}
                            >
                                {busy
                                    ? "Saving..."
                                    : editingId
                                        ? "Save changes"
                                        : "Create profile"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
