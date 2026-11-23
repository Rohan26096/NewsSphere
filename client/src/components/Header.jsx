
import { Search, Bell, Plus } from "lucide-react";

function Header({ onCreateProfile, onSearch }) {
    return (
        <header className="top-header">
            <div className="header-greeting">
                <span className="eyebrow">YOUR PERSONAL NEWS SPACE</span>
                <h2>Good evening!</h2>
            </div>

            <div className="header-actions">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search news..."
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>

                <button
                    className="icon-button"
                    aria-label="Notifications"
                >
                    <Bell size={19} />
                </button>

                <button
                    className="create-profile-btn"
                    onClick={onCreateProfile}
                >
                    <Plus size={18} />
                    <span>Create Profile</span>
                </button>
            </div>
        </header>
    );
}

export default Header;
