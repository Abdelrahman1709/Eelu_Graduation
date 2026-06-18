import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import reportWebVitals from "./utils/reportWebVitals";
import { initPerformanceMonitoring } from "./utils/performanceMonitoring";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

reportWebVitals((metric) => {
  const thresholds = { CLS: 0.1, FID: 100, LCP: 2500 };
  if (metric.value > (thresholds[metric.name] || 10000)) {
    console.warn(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)}`);
  }
});

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  initPerformanceMonitoring();
}

// Register Service Worker for offline support and caching only in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('[SW] Registration failed:', error);
        });
    });
  } else {
    // Unregister any service workers in development to avoid stale cached bundles.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}
