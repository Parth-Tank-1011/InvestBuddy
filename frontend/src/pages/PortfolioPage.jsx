import React, { useMemo, useState } from "react";
import { FiClock, FiPieChart, FiShield } from "react-icons/fi";
import { IndianRupee } from "lucide-react";
import PortfolioCard from "../components/PortfolioCard";
import { generatePortfolio } from "../services/api";
import { formatCurrency } from "../utils/helpers";

function PortfolioPage() {
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [risk, setRisk] = useState("Low");
  const [open, setOpen] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [message, setMessage] = useState("Enter details to generate portfolio");
  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const estimatedAmount = useMemo(() => Number(amount || 0), [amount]);

  async function handleGenerate(event) {
    event.preventDefault();

    if (!amount || !time) {
      setMessage("Enter investment amount and time period to generate portfolio");
      setPortfolioData(null);
      return;
    }

    setLoading(true);
    setMessage("Generating portfolio...");

    try {
      const response = await generatePortfolio({
        amount: parseFloat(amount),
        months: parseInt(time),
        risk: risk.toLowerCase(),
      });

      if (response.portfolio) {
        setPortfolioData(response.portfolio);
        setMessage("");
      } else {
        setMessage("Failed to generate portfolio. Please try again.");
        setPortfolioData(null);
      }
    } catch (error) {
      console.error("Error generating portfolio:", error);
      setMessage("Error generating portfolio. Please check your connection and try again.");
      setPortfolioData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToWatchlist(stock) {
    try {
      const stockData = {
        name: stock.name,
        symbol: stock.symbol,
        price: stock.price,
        change: stock.change,
      };

      const existing = JSON.parse(localStorage.getItem("watchlist") || "[]");
      const alreadyExists = existing.find((item) => item.symbol === stock.symbol);

      if (alreadyExists) {
        setWatchlistMessage(`${stock.name} is already in your watchlist.`);
        return;
      }

      const updated = [...existing, stockData];
      localStorage.setItem("watchlist", JSON.stringify(updated));
      setWatchlistMessage(`${stock.name} (${stock.symbol}) added to watchlist successfully!`);
    } catch (error) {
      setWatchlistMessage("Failed to add to watchlist. Please try again.");
      console.error("Error adding to watchlist:", error);
    }
  }

  return (
    <section className="page-shell space-y-8">
      <div>
        <p className="section-kicker">Smart allocation</p>
        <h1 className="section-title">Portfolio Generator</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
          Generate a simple rule-based stock basket from your amount, time horizon, and risk comfort.
        </p>
      </div>

      <form className="premium-panel p-5 sm:p-6 relative z-[50]" onSubmit={handleGenerate}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
              <IndianRupee className="h-4 w-4 text-cyan-400" />
              Investment Amount
            </span>
            <input
              className="fintech-input w-full"
              min="0"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount (₹)"
              type="number"
              value={amount}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
              <FiClock className="text-cyan-400" />
              Time Period
            </span>
            <input
              className="fintech-input w-full"
              min="1"
              onChange={(event) => setTime(event.target.value)}
              placeholder="Time in months"
              type="number"
              value={time}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
              <FiShield className="text-cyan-400" />
              Risk Level
            </span>
            <div className="relative overflow-visible w-full">
              <button
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 px-4 text-left text-[var(--text)] transition hover:border-cyan-400/40"
                onClick={() => setOpen(!open)}
                type="button"
              >
                {risk}
                <span className="text-xs text-[var(--text-muted)]">▼</span>
              </button>

              {open && (
                <div className="absolute left-0 right-0 z-[9999] mt-2 overflow-hidden rounded-2xl border border-[rgba(0,255,255,0.1)] bg-[#071226] shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                  {["Low", "Medium", "High"].map((item) => (
                    <button
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-[var(--text)] transition hover:bg-cyan-500 hover:text-white"
                      key={item}
                      onClick={() => {
                        setRisk(item);
                        setOpen(false);
                      }}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>

          <button className="primary-button px-6" disabled={loading} type="submit">
            <FiPieChart size={18} />
            {loading ? "Generating..." : "Generate Portfolio"}
          </button>
        </div>
      </form>

      {(message || watchlistMessage) && (
        <div className="premium-panel px-5 py-4 text-sm font-medium text-[var(--text-muted)]">
          {watchlistMessage || message}
        </div>
      )}

      {portfolioData && portfolioData.stocks && portfolioData.stocks.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Suggested allocation</p>
              <h2 className="text-2xl font-black text-[var(--text)]">{risk} Risk Portfolio</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              ₹{estimatedAmount.toLocaleString("en-IN")} over {time} months
            </p>
          </div>

          <div className="dashboard-card p-5">
            <h3 className="mb-4 text-lg font-black text-[var(--text)]">Portfolio Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryMetric label="Total Investment" value={formatCurrency(portfolioData.totalInvestment)} />
              <SummaryMetric label="Estimated Invested" tone="green" value={formatCurrency(portfolioData.estimatedInvested)} />
              <SummaryMetric label="Remaining Cash" tone="yellow" value={formatCurrency(portfolioData.remainingCash)} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {portfolioData.stocks.map((stock) => (
              <PortfolioCard key={stock.symbol} onAddToWatchlist={handleAddToWatchlist} stock={stock} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function SummaryMetric({ label, tone = "default", value }) {
  const toneClass = {
    default: "border-[var(--border)]/70 bg-[var(--bg)]/30 text-[var(--text)]",
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-400",
  };

  return (
    <div className={`rounded-2xl border p-4 text-center ${toneClass[tone] || toneClass.default}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export default PortfolioPage;
