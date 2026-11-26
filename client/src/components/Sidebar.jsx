
import { NavLink } from "react-router-dom";

import {
  Bookmark,
  Globe,
  Headphones,
  Home,
  LogOut,
  Settings,
  UserRound,
  MapPin,
  Newspaper,
  Highlighter
} from "lucide-react";

export default function Sidebar({ onLogout }) {
  const links = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      end: true,
    },
    {
      to: "/india-news",
      label: "India News",
      icon: MapPin,
    },
    {
      to: "/global-news",
      label: "Global News",
      icon: Newspaper,
    },
    {
      to: "/profiles",
      label: "My Profiles",
      icon: UserRound,
    },
    {
      to: "/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
    },
    {
      to: "/highlights",
      label: "My Highlights",
      icon: Highlighter
    },
  ];

  return (
    <aside className="sidebar">
      <NavLink to="/" className="logo">
        <Globe size={27} />
        <span>NewsSphere</span>
      </NavLink>

      <div className="sidebar-label">DISCOVER</div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="nav-item nav-disabled">
          <Headphones size={19} />
          <span>Briefings</span>
          <small>Soon</small>
        </div>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-label">PREFERENCES</div>

        <div className="nav-item nav-disabled">
          <Settings size={19} />
          <span>Settings</span>
        </div>

        <button
          className="nav-item logout-button"
          onClick={onLogout}
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <span className="status-dot" />
        NewsSphere is ready
      </div>
    </aside>
  );
}
