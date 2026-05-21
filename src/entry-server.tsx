// Server entry point used by `scripts/prerender.mjs`.
// Vite SSR builds this to dist-server/, then the prerender script imports
// it once per route to produce the static HTML for that route.

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import type { HelmetServerState } from "react-helmet-async";
import { AppContent, AppProviders } from "./App";

export interface RenderResult {
  html: string;
  helmet: HelmetServerState | undefined;
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <AppProviders helmetContext={helmetContext}>
      <StaticRouter location={url}>
        <AppContent />
      </StaticRouter>
    </AppProviders>,
  );
  return { html, helmet: helmetContext.helmet };
}
