import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatPercent } from "./utils/helpers";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchPage from "./pages/SearchPage";
import NewsPage from "./pages/NewsPage";
import PortfolioPage from "./pages/PortfolioPage";
import WatchlistPage from "./pages/WatchlistPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const pages = {
  search: SearchPage,
  news: NewsPage,
  portfolio: PortfolioPage,
  watchlist: WatchlistPage,
  about: AboutPage,
  login: LoginPage,
  register: RegisterPage,
};

const protectedPages = ["search", "news", "portfolio", "watchlist", "about"];
const publicPages = ["login", "register"];
const defaultProtectedPage = "search";

function pageFromPath(pathname) {
  const page = pathname.replace(/^\/+/, "").split("/")[0] || defaultProtectedPage;
  return pages[page] ? page : defaultProtectedPage;
}

function getStoredUser() {
  const storedUser = sessionStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    sessionStorage.removeItem("user");
    return null;
  }
}

function App() {
  const [activePage, setActivePage] = useState(() => pageFromPath(window.location.pathname));
  const [user, setUser] = useState(getStoredUser);
  const isPublicPage = publicPages.includes(activePage);
  const isProtectedPage = protectedPages.includes(activePage);
  const displayedPage = !user && isProtectedPage ? "login" : user && isPublicPage ? defaultProtectedPage : activePage;
  const CurrentPage = pages[displayedPage];

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const navigate = useCallback((page, options = {}) => {
    const nextPage = pages[page] ? page : defaultProtectedPage;
    const nextPath = `/${nextPage}`;

    if (window.location.pathname !== nextPath) {
      if (options.replace) {
        window.history.replaceState({}, "", nextPath);
      } else {
        window.history.pushState({}, "", nextPath);
      }
    }

    setActivePage(nextPage);
  }, []);

  useEffect(() => {
    function handlePopState() {
      setActivePage(pageFromPath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!user && isProtectedPage) {
      navigate("login", { replace: true });
    }

    if (user && isPublicPage) {
      navigate(defaultProtectedPage, { replace: true });
    }
  }, [isProtectedPage, isPublicPage, navigate, user]);

  const pageProps = useMemo(
    () => ({
      onLogin: setUser,
      onNavigate: navigate,
    }),
    [navigate],
  );

  function handleLogout() {
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("login", { replace: true });
  }

  if (publicPages.includes(displayedPage)) {
    return (
      <div className="app-background min-h-screen" style={{ color: 'var(--text)' }}>
        <CurrentPage {...pageProps} />
      </div>
    );
  }

  return (
    <div className="app-background min-h-screen" style={{ color: 'var(--text)' }}>
      <Sidebar activePage={activePage} onLogout={handleLogout} onNavigate={navigate} />
      <main className="relative min-h-screen overflow-visible lg:pl-[250px]">
        <div className="dashboard-hero-glow" />
        <div className="relative z-10">
          <Navbar
            onNavigate={navigate}
            user={user}
          />
          <ProtectedRoute onNavigate={navigate} user={user}>
            <CurrentPage {...pageProps} />
          </ProtectedRoute>
        </div>
      </main>
    </div>
  );
}

export default App;
