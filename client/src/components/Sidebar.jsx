
import {
  Home,
  Bookmark,
  UserRound,
  Settings,
  Headphones,
  Globe,
  PanelLeftClose
} from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <Globe size={27} />
        <span>NewsSphere</span>
      </div>

      <nav className="sidebar-nav">
        <a className="nav-item active" href="/">
          <Home size={19} />
          <span>Home</span>
        </a>

        <a className="nav-item" href="#profiles">
          <UserRound size={19} />
          <span>My Profiles</span>
        </a>

        <a className="nav-item" href="#bookmarks">
          <Bookmark size={19} />
          <span>Bookmarks</span>
        </a>

        <a className="nav-item" href="#briefings">
          <Headphones size={19} />
          <span>Briefings</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <a className="nav-item" href="#settings">
          <Settings size={19} />
          <span>Settings</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
