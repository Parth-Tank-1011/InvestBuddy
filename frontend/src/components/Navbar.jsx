import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { formatPercent } from "../utils/helpers";
import { fetchIndices } from "../services/api";

function Navbar({ onNavigate, user }) {
  const [indices, setIndices] = useState([
    { name: "NIFTY 50", change: null },
    { name: "SENSEX", change: null },
    { name: "BANK NIFTY", change: null },
  ]);

  useEffect(() => {
    const loadIndices = async () => {
      try {
        const data = await fetchIndices();
        const formatted = data.map((idx) => ({
          name: idx.name,
          change: idx.change_percent ?? null,
        }));
        setIndices(formatted);
      } catch (error) {
        console.error("Failed to fetch indices:", error);
      }
    };

    loadIndices();

    const interval = setInterval(() => {
      loadIndices();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-theme-border bg-theme-surface backdrop-blur-xl px-5 py-2.5 shadow-lg shadow-black/40">
        {/* Left — Market desk + indices */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-theme-muted lg:text-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
              <Sparkles size={13} />
            </span>
            <span className="hidden sm:inline">Market desk</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 xl:pb-0">
            {indices.map((index) => (
              <div
                key={index.name}
                className="shrink-0 rounded-lg border border-theme-border bg-theme-card px-2.5 py-1.5"
                title={index.name}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-theme-muted">
                  {index.name}
                </span>
                <span
                  className={`ml-1.5 text-[10px] font-black ${
                    index.change != null && index.change >= 0 ? "text-emerald-400" : "text-theme-danger"
                  }`}
                >
                  {formatPercent(index.change)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — profile only */}
        <div className="flex items-center gap-3">
          {user ? (
            <span className="flex max-w-[140px] items-center gap-2 truncate rounded-lg border border-cyan-500/20 bg-cyan-400/[0.06] px-2.5 py-1.5 text-sm font-bold text-theme-text">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 text-[10px] font-black text-white">
                {(user.username || "U").slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate">{user.username}</span>
            </span>
          ) : (
            <div className="flex items-center gap-3">
              <button
                className="ghost-button h-8 px-3 text-xs"
                onClick={() => onNavigate("login")}
                type="button"
              >
                Login
              </button>
              <button
                className="primary-button h-8 px-3 text-xs"
                onClick={() => onNavigate("register")}
                type="button"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
