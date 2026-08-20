import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/main.css";

try {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Root element with id 'root' was not found.");
  }

  const root = createRoot(rootElement);
  root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
} catch (error) {
  console.error("InvestBuddy failed to render:", error);
}
