
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Profiles from "./pages/Profiles";
import PersonalizedFeed from "./pages/PersonalizedFeed";
import Bookmarks from "./pages/Bookmarks";
import IndiaNews from "./pages/IndiaNews";
import GlobalNews from "./pages/GlobalNews";
import ArticleReader from "./pages/ArticleReader";
import Highlights from "./pages/Highlights";

import "./App.css";

function ComingSoon({ title }) {
  return (
    <main className="dashboard-page">
      <span className="eyebrow">NEWS SPHERE</span>
      <h1>{title}</h1>
      <p style={{ color: "#a1a1aa", marginTop: "12px" }}>
        This section is coming soon. We're building your news experience.
      </p>
    </main>
  );
}

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("newsphere_token")
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("newsphere_token", token);
    } else {
      localStorage.removeItem("newsphere_token");
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <Auth onAuthenticated={setToken} />;
  }

  return (
    <div className="app-layout">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/india-news" element={<IndiaNews />} />
          <Route path="/global-news" element={<GlobalNews />} />

          <Route path="/profiles" element={<Profiles />} />

          <Route
            path="/profiles/:profileId/feed"
            element={<PersonalizedFeed />}
          />

          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/article/:articleId" element={<ArticleReader />} />

          <Route path="/highlights" element={<Highlights />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
