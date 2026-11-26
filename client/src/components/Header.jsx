
import { Bell, Plus, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header({
    onSearch,
    onCreateProfile,
    title = "Good evening!"
}) {
    const location = useLocation();
    const navigate = useNavigate();

    const showCreate =
        location.pathname === "/" ||
        location.pathname === "/profiles";

    return (
        <header className="top-header">
            <div className="header-greeting">
                <span className="eyebrow">
                    YOUR PERSONAL NEWS SPACE
                </span>

                <h2>{title}</h2>
            </div>

            <div className="header-actions">
                <label className="search-box">
                    <Search size={18} />

                    <input
                        placeholder="Search news..."
                        onChange={(e) =>
                            onSearch?.(e.target.value)
                        }
                    />
                </label>

                <button
                    className="icon-button"
                    aria-label="Notifications"
                >
                    <Bell size={19} />
                </button>

                {showCreate && (
                    <button
                        className="create-profile-btn"
                        onClick={() =>
                            location.pathname === "/profiles"
                                ? onCreateProfile?.()
                                : navigate("/profiles")
                        }
                    >
                        <Plus size={18} />

                        <span>
                            {location.pathname === "/profiles"
                                ? "Create Profile"
                                : "My Profiles"}
                        </span>
                    </button>
                )}
            </div>
        </header>
    );
}
