import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Globe,
  Loader2,
  MapPin,
  Search,
  TrendingDown,
  TrendingUp,
  Zap,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { fetchStock, fetchPrediction, addToWatchlist } from "../services/api";
import ChartComponent from "../components/ChartComponent";
import StockCard from "../components/StockCard";
import CompanyOverview from "../components/CompanyOverview";
import { displayValue, formatCurrency, formatNumber, formatPercent, formatMarketCap, formatVolume } from "../utils/helpers";

const DEFAULT_PLACEHOLDER = "N/A";

  // New 3x3 matrix order following spec
  const KPI_STATUS = {
    sector: "Market segment",
    previous_close: "Stable yesterday",
    open: "Strong opening",
    high_52w: "Near peak zone",
    low_52w: "Recovery level",
    pe_ratio: "Fair valuation",
  };

  const KPI_MATRIX = [
    // Row 1 — Core Market Metrics
    { id: "sector", title: "Sector", icon: Briefcase, tone: "cyan", formatter: (v) => v, subtitle: "Market segment" },
    { id: "previous_close", title: "Previous Close", icon: Clock, tone: "blue", formatter: formatCurrency, subtitle: "Stable yesterday" },
    { id: "open", title: "Today's Open", icon: DollarSign, tone: "yellow", formatter: formatCurrency, subtitle: "Strong opening" },

    // Row 2 — Long-Term Analysis
    { id: "high_52w", title: "52 Week High", icon: ArrowUpRight, tone: "green", formatter: formatCurrency, subtitle: "Near peak zone" },
    { id: "low_52w", title: "52 Week Low", icon: ArrowDownRight, tone: "red", formatter: formatCurrency, subtitle: "Recovery level" },
    { id: "pe_ratio", title: "PE Ratio", icon: Activity, tone: "amber", formatter: displayValue, subtitle: "Fair valuation" },

    // Row 3 — AI Prediction Section (special styling)
    { id: "pred_1d", title: "1 Day Prediction", icon: Zap, tone: "cyan", isPrediction: true, subtitle: "AI next-day forecast" },
    { id: "pred_3d", title: "3 Day Prediction", icon: Calendar, tone: "blue", isPrediction: true, subtitle: "Short-term AI trend" },
    { id: "pred_5d", title: "5 Day Prediction", icon: Brain, tone: "violet", isPrediction: true, subtitle: "Mid-term AI outlook" },
  ];

function flagEmoji(code) {
  if (!code || code.length < 2) return null;
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return null;
  return String.fromCodePoint(...Array.from(upper, (c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function SearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [stock, setStock] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [predictionConfidence, setPredictionConfidence] = useState({ day1: null, day3: null, day5: null });
  const [inWatchlist, setInWatchlist] = useState(false);

  const classifyMarketCap = (mc) => {
    if (mc == null) return null;
    // try to coerce to number
    const n = typeof mc === 'number' ? mc : Number(String(mc).replace(/[,\$\s]/g, ''));
    if (Number.isNaN(n)) return null;
    if (n >= 10_000_000_000) return 'Large Cap';
    if (n >= 2_000_000_000) return 'Mid Cap';
    return 'Small Cap';
  };

  useEffect(() => {
    const handler = window.setTimeout(() => setDebouncedQuery(searchInput), 280);
    return () => window.clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
      return;
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightIndex(-1);
  }, [debouncedQuery]);

  const generatePredictionConfidence = () => ({
    day1: Math.floor(Math.random() * 15) + 72,
    day3: Math.floor(Math.random() * 19) + 60,
    day5: Math.floor(Math.random() * 24) + 45,
  });

  const handlePick = useCallback(
    async (symbol) => {
      setShowSuggestions(false);
      setSuggestions([]);
      setHighlightIndex(-1);
      setSearchInput(symbol);
      setLoadingStock(true);
      setLoadingPrediction(true);
      try {
        const [stockData] = await Promise.all([fetchStock(symbol)]);
        if (stockData?.error) {
          setStock(null);
          setSuggestions([]);
          return;
        }
        setStock(stockData);
        const predData = await fetchPrediction(symbol);
        setPredictions(predData);
        setPredictionConfidence(generatePredictionConfidence());
        const stored = JSON.parse(localStorage.getItem("watchlist") || "[]");
        setInWatchlist(stored.some((s) => s.symbol === symbol));
      } catch {
        setStock(null);
      } finally {
        setLoadingStock(false);
        setLoadingPrediction(false);
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (!showSuggestions || suggestions.length === 0) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % suggestions.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (event.key === "Escape") {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    },
    [showSuggestions, suggestions, highlightIndex],
  );

  const handleSearch = useCallback(
    (event) => {
      event.preventDefault();
      console.log("SEARCHING");
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        handlePick(suggestions[highlightIndex].symbol);
      } else {
        const q = searchInput.trim();
        if (q) handlePick(q);
      }
    },
    [highlightIndex, suggestions, searchInput, handlePick],
  );

  const handleAddToWatchlist = useCallback(async (stockToAdd) => {
    try {
      const item = {
        name: stockToAdd.company_name || stockToAdd.name,
        symbol: stockToAdd.symbol,
        price: stockToAdd.current_price || stockToAdd.price || null,
        change: stockToAdd.change_percent ?? stockToAdd.change ?? 0,
        high: stockToAdd.high_52w || null,
        low: stockToAdd.low_52w || null,
        pe: stockToAdd.pe_ratio || null,
      };
      await addToWatchlist(item);
      const stored = JSON.parse(localStorage.getItem("watchlist") || "[]");
      const already = stored.some((s) => s.symbol === item.symbol);
      if (!already) {
        localStorage.setItem("watchlist", JSON.stringify([...stored, item]));
      }
      setInWatchlist(true);
    } catch {
      const stored = JSON.parse(localStorage.getItem("watchlist") || "[]");
      const item = {
        name: stockToAdd.company_name || stockToAdd.name,
        symbol: stockToAdd.symbol,
        price: stockToAdd.current_price || stockToAdd.price || null,
        change: stockToAdd.change_percent ?? stockToAdd.change ?? 0,
        high: stockToAdd.high_52w || null,
        low: stockToAdd.low_52w || null,
        pe: stockToAdd.pe_ratio || null,
      };
      const already = stored.some((s) => s.symbol === item.symbol);
      if (!already) {
        localStorage.setItem("watchlist", JSON.stringify([...stored, item]));
      }
      setInWatchlist(true);
    }
  }, []);

  const positive = stock ? (stock.change_percent || 0) >= 0 : true;
  const trendIcon = positive ? TrendingUp : TrendingDown;
  const TrendIcon = trendIcon;
  const hqCountry = stock?.headquarters?.country || "";
  const flag = flagEmoji(hqCountry);

  const SuggestionsPopper = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    return (
      <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-theme-border bg-[#071226] p-1.5 shadow-xl shadow-black/50">
        {suggestions.map((s, i) => (
          <button
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-all ${
              i === highlightIndex ? "bg-cyan-500/15 text-cyan-300" : "text-theme-muted hover:bg-white/[0.04] hover:text-white"
            }`}
            key={s.symbol}
            onClick={() => handlePick(s.symbol)}
            type="button"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 font-black text-[10px] tracking-tight">{s.symbol.slice(0, 2)}</span>
            <span className="min-w-0">
              <span className="block font-bold text-white/90">{s.symbol}</span>
              <span className="truncate text-[11px]">{s.name}</span>
            </span>
          </button>
        ))}
      </div>
    );
  };

  const PredictionBadge = ({ signal }) => {
    const map = {
      BUY: { bg: "bg-emerald-400/10 text-emerald-400 border border-emerald-500/20", icon: TrendingUp, label: "BUY" },
      SELL: { bg: "bg-rose-400/10 text-rose-400 border border-rose-500/20", icon: TrendingDown, label: "SELL" },
      HOLD: { bg: "bg-amber-400/10 text-amber-400 border border-amber-500/20", icon: Activity, label: "HOLD" },
    };
    const style = map[signal] || map.HOLD;
    const StyleIcon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black ${style.bg}`}>
        <StyleIcon size={13} />
        {style.label}
      </span>
    );
  };

  const PredictionSection = () => {
    const predData = Array.isArray(predictions) ? predictions : null;
    if (!predData && !loadingPrediction) return null;
    if (loadingPrediction) {
      return (
        <section className="dashboard-card animate-fade-in p-5 sm:p-6">
          <p className="section-kicker">Algorithm outlook</p>
          <h2 className="mt-2 text-2xl font-black text-theme-text">
            Price Predictions <span className="text-theme-muted font-bold text-base ml-2">(Next 5 Days)</span>
          </h2>
          <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-3">
            {["1 Day", "3 Days", "5 Days"].map((label) => (
              <div key={label} className="rounded-2xl border border-theme-border bg-theme-card/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-theme-muted">{label}</p>
                <div className="mt-3 h-8 w-3/4 skeleton rounded" />
              </div>
            ))}
          </div>
        </section>
      );
    }
    return (
      <section className="dashboard-card animate-fade-in p-5 sm:p-6">
        <p className="section-kicker">Algorithmic outlook</p>
        <h2 className="mt-2 text-2xl font-black text-theme-text">
          Price Predictions <span className="text-theme-muted font-bold text-base ml-2">(Next 5 Days)</span>
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {["day1", "day3", "day5"].map((day, index) => {
            const pred = predData?.[day];
            if (pred == null) return null;
            const current = stock?.current_price || 0;
            const diff = current ? pred - current : 0;
            const isUp = diff > 0;
            const diffPct = current ? ((diff / current) * 100).toFixed(2) : "0.00";
            return (
              <article key={day} className="animate-fade-in group flex flex-col rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.04] p-5 transition-all duration-300 hover:border-cyan-500/25 hover:shadow-[0_0_24px_rgba(6,182,212,0.1)]" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-cyan-400 shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-cyan-300">
                    {index === 0 ? "1 Day" : index === 1 ? "3 Days" : "5 Days"} Prediction
                  </p>
                </div>
                <p className="mt-5 text-3xl font-black text-white">{formatCurrency(pred)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${isUp ? "bg-emerald-400/15 text-emerald-400" : "bg-rose-400/15 text-rose-400"}`}>
                    <Activity size={12} />
                  </span>
                  <span className={`text-xs font-black ${isUp ? "text-emerald-400" : "text-rose-400"}`}>{isUp ? "+" : ""}{diffPct}%</span>
                  <span className="text-[11px] text-theme-muted">vs today</span>
                </div>
                <div className="mt-3.5 h-1 w-full overflow-hidden rounded-full bg-theme-border/50">
                  <div className={`h-full rounded-full transition-all duration-700 ${isUp ? "from-emerald-500 to-green-500 bg-gradient-to-r" : "from-rose-500 to-red-500 bg-gradient-to-r"}`} style={{ width: `${Math.min(Math.abs(parseFloat(diffPct)), 100) / 100 * 100}%` }} />
                </div>
              </article>
            );
          })}
        </div>
        {(predData?.signal || predData?.confidence != null) && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.04] p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-theme-muted">Suggestion</span>
              <PredictionBadge signal={predData.signal} />
            </div>
            {predData.confidence != null && (
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                  <span>Confidence</span>
                  <span className="text-theme-text">{predData.confidence}%</span>
                </div>
                <div className="h-full w-full overflow-hidden rounded-full bg-theme-border/50">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700" style={{ width: `${Math.min(parseFloat(predData.confidence || 0), 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-8">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="search-stock-info">
          <div className="flex items-center gap-3">
            <h2 className="search-stock-title text-3xl font-black">{stock ? stock.company_name : "Select a Stock"}</h2>
            {stock && <span className="cursor-default rounded-lg border border-theme-border bg-theme-card px-2.5 py-1 text-[11px] font-black text-theme-muted">{stock.symbol}</span>}
          </div>
          {stock && (
            <p className="mt-1.5 text-sm font-bold">
              <span className="search-stock-price">{formatCurrency(stock.current_price)}</span>
              {stock.change_percent != null && (
                <span className={`ml-2 ${positive ? "search-stock-change-pos" : "search-stock-change-neg"}`}>
                  {positive ? "+" : ""}{formatPercent(stock.change_percent)}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 z-10 pointer-events-none" />

              <input
                type="text"
                className="w-full h-10 bg-theme-surface text-theme-text placeholder:text-theme-muted outline-none rounded-lg pl-12 pr-4 text-sm border border-theme-border backdrop-blur-sm transition-all duration-300 focus:border-cyan-500/40 focus:shadow-[0_0_12px_rgba(6,182,212,0.08)]"
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Search stock symbol..."
                value={searchInput}
              />
              <SuggestionsPopper />
            </div>

            <button
              type="submit"
              className="shrink-0 rounded-lg px-5 py-2.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(6,182,212,0.35),0_6px_24px_rgba(6,182,212,0.15)] focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-surface disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_16px_rgba(6,182,212,0.12)]"
              style={{
                background: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)",
                boxShadow: "0 4px 20px rgba(6, 182, 212, 0.25)",
              }}
              disabled={!searchInput.trim()}
            >
              <span className="flex items-center gap-2">
                {loadingStock ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {loadingStock ? "Loading..." : "Search"}
              </span>
            </button>
          </form>
          {(!stock || !inWatchlist) && !(stock && inWatchlist) && (
            <button
              className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.10] to-emerald-600/[0.06] px-5 py-2.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-500/[0.18] hover:to-emerald-600/[0.12] hover:border-emerald-500/35 hover:shadow-[0_0_24px_rgba(16,185,129,0.35),0_6px_24px_rgba(16,185,129,0.15)] focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-surface disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              onClick={() => !loadingStock && stock && handleAddToWatchlist(stock)}
              disabled={!stock || loadingStock}
              type="button"
            >
              <Eye size={15} />
              <span className="hidden sm:inline">Add to Watchlist</span>
              <span className="sm:hidden">Watchlist</span>
            </button>
          )}
          {stock && inWatchlist && (
            <span className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.10] to-emerald-600/[0.06] px-5 py-2.5 text-sm font-black text-white/90">
              <TrendingUp size={15} />
              In Watchlist
            </span>
          )}
        </div>
      </section>

<section className="mb-6">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {KPI_MATRIX.map((m, idx) => {
             // handle prediction cards
             if (m.isPrediction) {
               const predKey = idx === 6 ? 'day1' : idx === 7 ? 'day3' : 'day5';
               const predVal = predictions ? predictions[predKey] : null;
               const formatted = predVal != null ? formatCurrency(predVal) : DEFAULT_PLACEHOLDER;
               const conf = predictionConfidence[predKey];
               return (
                 <StockCard
                   key={m.id}
                   icon={m.icon}
                   tone={m.tone}
                   title={m.title}
                   subtitle={m.subtitle}
                   value={formatted}
                   confidence={conf}
                   isPrediction={true}
                 />
               );
             }

             const rawVal = stock ? stock[m.id] : null;
             const formatted = rawVal != null ? (m.formatter ? m.formatter(rawVal) : String(rawVal)) : DEFAULT_PLACEHOLDER;
             return (
               <StockCard
                 key={m.id}
                 icon={m.icon}
                 tone={m.tone}
                 title={m.title}
                 subtitle={m.subtitle || KPI_STATUS[m.id]}
                 value={formatted}
               />
             );
           })}
         </div>
        </section>

         {stock && (() => {
           const hq  = stock.headquarters || {};
           const city     = hq.city  || "";
           const state    = hq.state || "";
           const country  = hq.country || "";

           // CEO: backend key is "ceo"; fall back to derived from companyOfficers if needed
           const ceo = stock.ceo
                     || (() => {
                         const officers = stock.companyOfficers || [];
                         if (officers.length === 0) return null;
                         const priority = officers.find(o => /(chief executive|ceo|managing director|md\b)/i.test(o.title || ""));
                         return priority ? priority.name : officers[0].name;
                       })();

           // Founded year: backend key is "founded_year"; secondary: regex scan summary
           const foundedRaw = stock.founded_year
                           || (() => {
                               const s = stock.long_business_summary || stock.description || "";
                               const m = s.match(/\b(1[5-9]\d{2}|20[0-2]\d)\b/);
                               return m ? parseInt(m[0]) : null;
                             })();

           // Competitors from backend (sector-based); fallback per sector locally
           const SECTOR_COMPETITORS = {
             "IT": ["TCS", "Infosys", "Wipro", "HCLTech", "Tech Mahindra"],
             "Banking": ["HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "SBI"],
             "Auto": ["Tata Motors", "Mahindra & Mahindra", "Maruti Suzuki", "Bajaj Auto", "Hero MotoCorp"],
           };
           const getSectorKey = (s) => {
             if (!s) return null;
             if (/Information Technology|Technology|IT Services/i.test(s)) return "IT";
             if (/Bank|Financial|NBFC/i.test(s)) return "Banking";
             if (/Auto|Automobile|Automotive/i.test(s)) return "Auto";
             return null;
           };
           const sectorKey = getSectorKey(stock.sector || stock.industry || "");
           const competitorsArr = Array.isArray(stock.competitors) && stock.competitors.length > 0
             ? stock.competitors
             : (SECTOR_COMPETITORS[sectorKey] || []);

           const companyOverview = {
             companyName:  stock.company_name || stock.name || stock.symbol,
             description:  stock.long_business_summary || stock.description || "Company description currently unavailable.",
             ceo,
             headquarters: [city, state, country].filter(Boolean).join(", ") || null,
             founded:      foundedRaw,
             marketCap:    stock.market_cap,
             volume:       stock.volume,
             industry:     stock.industry || stock.sector || null,
             competitors:  competitorsArr,
           };

        return (
          <CompanyOverview
            companyName={companyOverview.companyName}
            description={companyOverview.description}
            ceo={companyOverview.ceo}
            headquarters={companyOverview.headquarters}
            founded={companyOverview.founded}
            marketCap={formatMarketCap(companyOverview.marketCap)}
            volume={formatVolume(companyOverview.volume)}
            industry={companyOverview.industry}
            competitors={companyOverview.competitors}
          />
        );
      })()}

      <div className="space-y-6 mt-8">
        <PredictionSection />
        {stock ? (
          <ChartComponent prices={stock.history || []} />
        ) : (
          <section className="dashboard-card p-4 sm:p-5">
            <div className="flex h-64 items-center justify-center text-center">
              <p className="text-base font-bold text-theme-text">No data available</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
