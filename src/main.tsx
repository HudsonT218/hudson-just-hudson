import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Routes for which `scripts/prerender.mjs` produces static HTML at build
// time. When the request URL matches one of these AND #root has prerendered
// children, we hydrate. For every other URL (SPA-only routes, 404s) the
// hosting layer falls back to serving the prerendered `/` HTML, which
// React would try to hydrate as the homepage — that mismatches the actual
// route and causes a hydration warning + a flash. Detecting the mismatch
// here and switching to createRoot avoids the warning.
const PRERENDERED_ROUTES = new Set([
  "/",
  "/builds",
  "/ai-brief",
  "/finance-tools",
  "/finance-tools/filing-summarizer",
  "/updates",
  "/resources",
  "/resources/is-your-data-safe-with-ai",
  "/resources/ai-glossary",
]);

const rootElement = document.getElementById("root")!;
const path = window.location.pathname.replace(/\/$/, "") || "/";

if (rootElement.firstElementChild && PRERENDERED_ROUTES.has(path)) {
  hydrateRoot(rootElement, <App />);
} else {
  // Either the route has no prerender (clean SPA boot) or the hosting
  // served the wrong prerendered HTML for this URL — wipe and re-render
  // so React doesn't try to hydrate mismatched markup.
  rootElement.innerHTML = "";
  createRoot(rootElement).render(<App />);
}
