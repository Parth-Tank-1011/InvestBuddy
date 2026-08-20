const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(response.statusText || "Server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function fetchStock(symbol) {
  return request(`/api/stock/${symbol}`);
}

export function fetchPrediction(symbol) {
  return request(`/api/stock/${symbol}/prediction`);
}

export function fetchIndices() {
  return request("/api/indices");
}

export function registerUser(user) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function loginUser(credentials) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function fetchNews() {
  return request("/api/news");
}

export function generatePortfolio(data) {
  return request("/api/portfolio", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchWatchlist() {
  return request("/api/watchlist");
}

export function addToWatchlist(stock) {
  return request("/api/watchlist", {
    method: "POST",
    body: JSON.stringify(stock),
  });
}

export function deleteFromWatchlist(symbol) {
  return request(`/api/watchlist/${symbol}`, {
    method: "DELETE",
  });
}
