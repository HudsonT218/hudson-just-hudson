import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { prerenderPlugin } from "./scripts/prerender-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Prerender runs after the client build only (skipped for SSR builds and dev).
    mode !== "development" && prerenderPlugin(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  // Replaced at build time. Footer copyright uses this instead of
  // `new Date().getFullYear()` so prerendered HTML and the hydrated client
  // render identical text (avoids React hydration warnings).
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  // SSR-build config used by `vite build --ssr src/entry-server.tsx`.
  // `react-helmet-async` ships ESM with a HelmetProvider export shape that
  // breaks when Vite externalizes it for SSR — force it through the bundler.
  ssr: {
    noExternal: ["react-helmet-async"],
  },
}));
