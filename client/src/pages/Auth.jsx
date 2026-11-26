
import { useState } from "react";
import { Globe, Lock, Mail, UserRound } from "lucide-react";

import api from "../services/api";

export default function Auth({ onAuthenticated }) {
    const [mode, setMode] = useState("login");

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const update = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const submit = async (e) => {
        e.preventDefault();

        setBusy(true);
        setError("");

        try {
            const endpoint =
                mode === "login"
                    ? "/auth/login"
                    : "/auth/register";

            const payload =
                mode === "login"
                    ? {
                          email: form.email,
                          password: form.password
                      }
                    : form;

            const response = await api.post(endpoint, payload);

            if (mode === "register") {
                setMode("login");
                setError(
                    "Account created. Sign in with your new credentials."
                );
            } else {
                onAuthenticated(response.data.token);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to authenticate. Check the backend and try again."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-panel">
                <div className="auth-brand">
                    <Globe size={30} />
                    <span>NewsSphere</span>
                </div>

                <p className="eyebrow">
                    YOUR PERSONAL NEWS SPACE
                </p>

                <h1>
                    {mode === "login"
                        ? "Welcome back."
                        : "Create your account."}
                </h1>

                <p className="auth-subtitle">
                    Stay informed about the topics that matter to you.
                </p>

                <form onSubmit={submit} className="auth-form">
                    {mode === "register" && (
                        <label className="form-field">
                            <UserRound size={17} />
                            <input
                                name="username"
                                placeholder="Your name"
                                value={form.username}
                                onChange={update}
                                required
                            />
                        </label>
                    )}

                    <label className="form-field">
                        <Mail size={17} />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={update}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <Lock size={17} />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={update}
                            minLength={6}
                            required
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
                            ? "Please wait..."
                            : mode === "login"
                                ? "Sign in"
                                : "Create account"}
                    </button>
                </form>

                <p className="auth-switch">
                    {mode === "login"
                        ? "New to NewsSphere?"
                        : "Already have an account?"}

                    <button
                        onClick={() => {
                            setMode(
                                mode === "login"
                                    ? "register"
                                    : "login"
                            );
                            setError("");
                        }}
                    >
                        {mode === "login"
                            ? "Create an account"
                            : "Sign in"}
                    </button>
                </p>
            </section>
        </main>
    );
}
