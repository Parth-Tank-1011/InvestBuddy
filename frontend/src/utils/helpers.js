export function formatCurrency(value) {
  if (value === null || value === undefined || value === "N/A") return "N/A";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value).replace(/\u00A0/g, ' ');
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "N/A") return "N/A";
  return Number(value).toFixed(2);
}

export function formatMarketCap(value) {
  if (value === null || value === undefined) return "N/A";
  // If already a formatted-like string (e.g. "4500000000" or 4_500_000_000) → format as ₹T / ₹B / ₹Cr
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `₹${(abs / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000) return `₹${(abs / 1_000_000).toFixed(2)}Cr`;
  if (abs >= 1_000_000_000) return `₹${(abs / 1_000_000_000).toFixed(2)}B`;
  return `₹${abs.toLocaleString("en-IN")}`;
}

export function formatVolume(value) {
  if (value === null || value === undefined) return "N/A";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(1)}K`;
  return abs.toLocaleString("en-IN");
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";

  const number = Number(value);
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(2)}%`;
}

export function displayValue(value, prefix = "") {
  if (value === null || value === undefined || value === "") return "N/A";
  return `${prefix}${value}`;
}

export function displayPE(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return value;
}
