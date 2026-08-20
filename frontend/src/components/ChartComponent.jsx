import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../utils/helpers";

const ranges = [
  { id: "1W", label: "1 Week" },
  { id: "1M", label: "1 Month" },
  { id: "1Y", label: "1 Year" },
];

function ChartComponent({ prices = [] }) {
  const [activeRange, setActiveRange] = useState("1W");
  const [switchingRange, setSwitchingRange] = useState(false);
  const safePrices = useMemo(() => normalizePrices(prices), [prices]);
  const filteredPrices = useMemo(
    () => getRangeData(safePrices, activeRange),
    [safePrices, activeRange],
  );

  function handleRangeChange(nextRange) {
    if (nextRange === activeRange) return;

    setSwitchingRange(true);
    setActiveRange(nextRange);
    window.setTimeout(() => setSwitchingRange(false), 220);
  }

  if (!filteredPrices || filteredPrices.length === 0) {
    return (
      <section className="dashboard-card animate-fade-in p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-theme-text">Price movement</h2>
          </div>
          <RangeButtons activeRange={activeRange} onRangeChange={handleRangeChange} />
        </div>
        <div className="flex h-72 items-center justify-center rounded-2xl border border-theme-border/30 bg-theme-card/50 p-6 text-center">
          <div>
            <p className="text-base font-bold text-theme-text">Chart data currently unavailable</p>
            <p className="mt-2 text-sm leading-6 text-theme-muted">
              Stock details loaded successfully, but historical prices are not available right now.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const data = filteredPrices.map((item, index) => ({

    day: formatChartDate(item.date, activeRange) || item.day || `Day ${index + 1}`,
    price: item.price,
  }));
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const change = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const positive = change >= 0;

  return (
    <section className="dashboard-card animate-fade-in overflow-hidden\">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 pt-4 sm:pt-5">
        <h2 className="text-2xl font-black text-theme-text">Price movement</h2>
        <RangeButtons activeRange={activeRange} onRangeChange={handleRangeChange} />
      </div>

      <div className="relative h-72 px-4 sm:px-5 pb-4 sm:pb-5">
        {switchingRange && (
          <div className="absolute inset-4 sm:inset-5 z-10 flex items-center justify-center rounded-lg bg-[#071226]/70 backdrop-blur-sm">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-300" />
          </div>
        )}
        <ResponsiveContainer height="100%" width="100%">
          <LineChart key={activeRange} data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="priceStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 8" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="day"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={["auto", "auto"]}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickFormatter={(value) => `Rs ${value}`}
              tickLine={false}
              width={64}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.92)",
                border: "1px solid rgba(34, 211, 238, 0.28)",
                borderRadius: "16px",
                boxShadow: "0 18px 50px rgba(6, 182, 212, 0.14)",
                color: "var(--text)",
                backdropFilter: "blur(16px)",
              }}
              formatter={(value) => [formatCurrency(value), "Price"]}
              labelStyle={{ color: "var(--text-muted)" }}
            />
            <Line
              activeDot={{ fill: "var(--accent)", r: 6, stroke: "var(--bg)", strokeWidth: 3 }}
              dataKey="price"
              dot={data.length < 8}
              isAnimationActive
              stroke="url(#priceStroke)"
              strokeLinecap="round"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function RangeButtons({ activeRange, onRangeChange }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-full border border-theme-border/30 bg-theme-card/40 p-1">
      {ranges.map((range) => (
        <button
          className={`rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.08em] transition duration-300 ${
            activeRange === range.id
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
              : "text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
          key={range.id}
          onClick={() => onRangeChange(range.id)}
          type="button"
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

function normalizePrices(prices) {
  if (!Array.isArray(prices)) {
    return [];
  }

  const seenDates = new Set();

  return prices
    .map((item, index) => normalizePricePoint(item, index))
    .filter(Boolean)
    .sort((a, b) => a.sortTime - b.sortTime)
    .filter((item) => {
      if (!item.dateKey) {
        return true;
      }

      if (seenDates.has(item.dateKey)) {
        return false;
      }

      seenDates.add(item.dateKey);
      return true;
    });
}

function normalizePricePoint(item, index) {
  if (typeof item === "number" || typeof item === "string") {
    const price = Number(item);

    return Number.isNaN(price)
      ? null
      : {
          day: `Day ${index + 1}`,
          price,
          sortTime: index,
        };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const price = Number(item.price ?? item.close ?? item.Close ?? item.value ?? item.adjClose ?? item.adj_close);

  if (Number.isNaN(price)) {
    return null;
  }

  const rawDate = item.date ?? item.timestamp ?? item.time ?? item.datetime ?? "";
  const date = normalizeDate(rawDate);

  return {
    date: date?.toISOString() || "",
    dateKey: date ? toDateKey(date) : "",
    day: item.day || `Day ${index + 1}`,
    price,
    sortTime: date?.getTime() ?? index,
  };
}

function getRangeData(prices, activeRange) {
  if (activeRange === "1W") {
    return prices.slice(-7);
  }

  if (activeRange === "1M") {
    return prices.slice(-30).filter((_, index) => index % 2 === 0).slice(-15);
  }

  const monthlyLatest = new Map();

  prices.forEach((item) => {
    const date = normalizeDate(item.date);
    if (!date) return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    monthlyLatest.set(monthKey, item);
  });

  const monthlyData = Array.from(monthlyLatest.values()).slice(-12);
  return monthlyData.length ? monthlyData : prices.slice(-12);
}

function rangeTitle(activeRange) {
  if (activeRange === "1M") return "1 Month trend";
  if (activeRange === "1Y") return "1 Year overview";
  return "1 Week movement";
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "number") {
    const timestamp = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatChartDate(value, activeRange) {
  const date = normalizeDate(value);

  if (!date) {
    return "";
  }

  return formatDate(date, activeRange);
}

function formatDate(date, activeRange) {
  if (activeRange === "1Y") {
    return date.toLocaleDateString("en-IN", {
      month: "short",
    });
  }

  if (activeRange === "1W") {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default ChartComponent;
