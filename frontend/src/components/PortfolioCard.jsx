import React from "react";
import { FiPlus, FiTrendingUp } from "react-icons/fi";
import { formatCurrency } from "../utils/helpers";

const tagStyles = {
  stable: "bg-green-400/10 text-green-300 ring-green-400/25",
  balanced: "bg-yellow-400/10 text-yellow-300 ring-yellow-400/25",
  growth: "bg-red-400/10 text-red-300 ring-red-400/25",
};

function PortfolioCard({ stock, onAddToWatchlist }) {
  const allocation = Math.min(Math.max(Number(stock.allocationPercent || 0), 0), 100);

  return (
    <article className="dashboard-card animate-fade-in flex min-h-56 flex-col p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Suggested stock</p>
          <h3 className="mt-2 text-2xl font-black text-theme-text">{stock.name}</h3>
          <p className="mt-1 text-sm font-bold text-theme-muted">{stock.symbol}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20">
          <FiTrendingUp size={19} />
        </span>
      </div>

      <div className="mb-4 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--text-muted)]">Current Price</p>
          <p className="text-lg font-bold text-[var(--text)]">{formatCurrency(stock.price)}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--text-muted)]">Allocation</p>
          <p className="text-lg font-bold text-[var(--text)]">{stock.allocationPercent}%</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--text-muted)]">Quantity</p>
          <p className="text-lg font-bold text-[var(--text)]">{stock.quantity}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--text-muted)]">Total Invested</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(stock.invested)}</p>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-theme-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-700"
          style={{ width: `${allocation}%` }}
        />
      </div>

      <span className={`mb-6 w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${tagStyles[stock.category.toLowerCase()] || tagStyles.stable}`}>
        {stock.category}
      </span>

      <button
        className="primary-button mt-auto"
        onClick={() => {
          onAddToWatchlist({
            name: stock.name,
            symbol: stock.symbol,
            price: stock.price,
            change: null
          });
        }}
        type="button"
      >
        <FiPlus size={17} />
        Add to Watchlist
      </button>
    </article>
  );
}

export default PortfolioCard;

