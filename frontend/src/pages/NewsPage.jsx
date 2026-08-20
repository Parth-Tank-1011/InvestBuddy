import React, { useCallback, useEffect, useState } from "react";
import NewsCard from "../components/NewsCard";
import { fetchNews } from "../services/api";

const NEWS_REFRESH_MS = 3 * 60 * 1000;

function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadNews = useCallback(async ({ showSkeleton = false } = {}) => {
    if (showSkeleton) {
      setLoading(true);
    }
    setError("");

    try {
      const data = await fetchNews();
      const nextArticles = Array.isArray(data) ? data : data.articles || [];
      setArticles(nextArticles);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (requestError) {
      setError(requestError.message || "Unable to load market news right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews({ showSkeleton: true });
    const interval = window.setInterval(() => loadNews(), NEWS_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [loadNews]);

  const filteredNews = getUniqueImageNews(articles).slice(0, 8);

  return (
    <section className="page-shell">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Live market brief</p>
          <h1 className="section-title">
            Stock Market News
          </h1>
        </div>
        {lastUpdated && (
          <p className="metric-pill">Updated {lastUpdated}</p>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-theme-danger-light bg-theme-danger-light px-4 py-3 text-sm text-theme-danger-light">
          {error}
        </div>
      )}

      {loading ? (
        <NewsSkeletonGrid />
      ) : filteredNews.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredNews.map((article) => (
            <NewsCard article={article} key={article.link || article.title} />
          ))}
        </div>
      ) : (
        <div className="dashboard-card p-8 text-center">
          <p className="text-lg font-black text-theme-text">No live news available right now.</p>
          <p className="mt-2 text-sm text-theme-muted">InvestBuddy will refresh this page automatically.</p>
        </div>
      )}
    </section>
  );
}

function getUniqueImageNews(news) {
  const usedImages = new Set();

  return news.filter((item) => {
    const image = item.image || item.thumbnail;

    if (!image) return false;
    if (usedImages.has(image)) return false;

    usedImages.add(image);
    return true;
  });
}

function NewsSkeletonGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="dashboard-card p-5" key={index}>
          <div className="skeleton mb-4 h-44 w-full" />
          <div className="skeleton mb-4 h-4 w-32" />
          <div className="skeleton mb-3 h-6 w-5/6" />
          <div className="skeleton mb-2 h-4 w-full" />
          <div className="skeleton mb-6 h-4 w-3/4" />
          <div className="skeleton h-10 w-32" />
        </div>
      ))}
    </div>
  );
}

export default NewsPage;
