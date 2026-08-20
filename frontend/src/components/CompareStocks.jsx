import React from "react";
import { displayPE, displayValue, formatCurrency, formatPercent } from "../utils/helpers";

const metrics = [
  { key: "price", label: "Current Price", formatter: (value) => (value ? formatCurrency(value) : "N/A"), higherIsBetter: true },
  { key: "change", label: "% Change", formatter: formatPercent, higherIsBetter: true },
  { key: "high", label: "52 Week High", formatter: (value) => displayValue(value, "₹ "), higherIsBetter: true },
  { key: "low", label: "52 Week Low", formatter: (value) => displayValue(value, "₹ "), higherIsBetter: false },
  { key: "pe", label: "PE Ratio", formatter: displayPE, higherIsBetter: false },
];

function CompareStocks({ watchlist, selectedStock1, selectedStock2, onSelectStock1, onSelectStock2 }) {
  const stock1 = watchlist.find((stock) => stock.name === selectedStock1);
  const stock2 = watchlist.find((stock) => stock.name === selectedStock2);

  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="mb-5">
        <p className="section-kicker">Stock Comparison</p>
        <h2 className="mt-2 text-2xl font-black text-theme-text">Compare Stocks</h2>
      </div>

      {watchlist.length < 2 ? (
        <p className="rounded-2xl border border-theme-border bg-theme-surface-soft p-4 text-sm text-theme-muted">
          Add at least two stocks to compare.
        </p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <SelectStock label="Stock 1" onChange={onSelectStock1} options={watchlist} value={selectedStock1} />
            <SelectStock label="Stock 2" onChange={onSelectStock2} options={watchlist} value={selectedStock2} />
          </div>

          {stock1 && stock2 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <ComparisonCard competitor={stock2} stock={stock1} />
              <ComparisonCard competitor={stock1} stock={stock2} />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SelectStock({ label, options, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-theme-muted">{label}</span>
      <select className="fintech-input w-full" onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((stock) => (
          <option key={stock.name} value={stock.name}>
            {stock.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparisonCard({ stock, competitor }) {
  return (
    <article className="animate-fade-in rounded-2xl border border-theme-border bg-theme-surface-soft p-5">
      <h3 className="mb-5 text-xl font-black text-theme-text">{stock.name}</h3>
      <div className="space-y-3">
        {metrics.map((metric) => (
          <MetricRow
            competitorValue={competitor[metric.key]}
            key={metric.key}
            metric={metric}
            value={stock[metric.key]}
          />
        ))}
      </div>
    </article>
  );
}

function MetricRow({ metric, value, competitorValue }) {
  const isBetter = metric.higherIsBetter ? value >= competitorValue : value <= competitorValue;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-theme-border bg-theme-bg/30 px-4 py-3">
      <span className="text-sm text-theme-muted">{metric.label}</span>
      <span className={`text-sm font-black ${isBetter ? "text-theme-success" : "text-theme-danger"}`}>
        {metric.formatter(value)}
      </span>
    </div>
  );
}

export default CompareStocks;
