#!/usr/bin/env node
// Build-time prerender script for hudsonturansky.com.
//
// Pipeline (orchestrated from package.json):
//   1. `vite build`                                    → dist/ (client SPA)
//   2. `vite build --ssr src/entry-server.tsx ...`     → dist-server/ (Node-runnable render fn)
//   3. `node scripts/prerender.mjs`  (this file)       → reads dist/index.html as a template,
//                                                        renders each ROUTE_LIST entry via the
//                                                        server bundle, injects rendered HTML +
//                                                        Helmet head tags back into the template,
//                                                        writes one HTML file per route under dist/.
//
// The output is regular static HTML — exactly what GPTBot, ClaudeBot,
// PerplexityBot, OAI-SearchBot etc. (none of which run JS) see when they
// crawl. The same HTML is served to logged-in users; `src/main.tsx` uses
// `hydrateRoot` so React adopts the prerendered tree.
//
// Routes we PRE-render (public, indexable). Configurator/admin/auth/preview/
// reference routes are intentionally left as SPA — they're either gated or
// excluded from search via robots.txt.

import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const DIST_SERVER = path.join(ROOT, "dist-server");
const TEMPLATE_PATH = path.join(DIST, "index.html");

const ROUTE_LIST = [
  { url: "/", outFile: "index.html" },
  { url: "/work", outFile: "work/index.html" },
  { url: "/ai-brief", outFile: "ai-brief/index.html" },
  { url: "/free-build", outFile: "free-build/index.html" },
  { url: "/resources", outFile: "resources/index.html" },
  { url: "/resources/ai-for-small-business", outFile: "resources/ai-for-small-business/index.html" },
  { url: "/resources/what-custom-ai-costs", outFile: "resources/what-custom-ai-costs/index.html" },
  {
    url: "/resources/hire-ai-help-or-do-it-yourself",
    outFile: "resources/hire-ai-help-or-do-it-yourself/index.html",
  },
  {
    url: "/resources/what-small-businesses-use-ai-for",
    outFile: "resources/what-small-businesses-use-ai-for/index.html",
  },
  {
    url: "/resources/ai-glossary-for-business-owners",
    outFile: "resources/ai-glossary-for-business-owners/index.html",
  },
  {
    url: "/resources/is-your-data-safe-with-ai",
    outFile: "resources/is-your-data-safe-with-ai/index.html",
  },
  {
    url: "/resources/ai-for-contractors",
    outFile: "resources/ai-for-contractors/index.html",
  },
  {
    url: "/resources/ai-for-professional-services",
    outFile: "resources/ai-for-professional-services/index.html",
  },
  {
    url: "/resources/ai-for-small-ecommerce",
    outFile: "resources/ai-for-small-ecommerce/index.html",
  },
];

// --- Browser-global polyfills (minimal) -----------------------------------
// IMPORTANT: stay minimal. Every polyfill below tricks some library into
// thinking it's running in a browser, which can cause:
//   - react-helmet-async to queue DOM commits via rAF instead of populating
//     the server-side context synchronously (then we get no head tags).
//   - sonner/Radix portals to try to mount into a fake document.body.
//
// Libraries that do `if (typeof window !== "undefined")` to detect "client
// mode" need `window`/`document` to stay UNDEFINED so they skip client-only
// code paths. The only polyfill we cannot skip is `localStorage`, which
// `src/integrations/supabase/client.ts` references directly (not behind a
// typeof guard) when constructing the auth client.

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = noopStorage;
}
if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = noopStorage;
}

// --- Template + module loading --------------------------------------------

const template = await fs.readFile(TEMPLATE_PATH, "utf8");

// Find the entry-server output by reading the SSR build's manifest-free
// dist-server folder. Vite writes one .js file per entry — the SSR build
// for `src/entry-server.tsx` outputs `entry-server.js` by default.
const serverEntryPath = path.join(DIST_SERVER, "entry-server.js");
try {
  await fs.access(serverEntryPath);
} catch {
  console.error(
    `[prerender] expected SSR build output at ${serverEntryPath}. ` +
      `Did \`vite build --ssr src/entry-server.tsx --outDir dist-server\` run first?`,
  );
  process.exit(1);
}

const serverModule = await import(serverEntryPath);
if (typeof serverModule.render !== "function") {
  console.error(`[prerender] server bundle has no render() export`);
  process.exit(1);
}

// --- Render each route ----------------------------------------------------

let failures = 0;

for (const { url, outFile } of ROUTE_LIST) {
  try {
    const { html, helmet } = serverModule.render(url);

    if (process.env.PRERENDER_DEBUG === "1") {
      console.log(`[prerender:debug] ${url} helmet keys:`, helmet ? Object.keys(helmet) : "undefined");
      if (helmet) {
        console.log(`[prerender:debug] ${url} title:`, helmet.title?.toString());
        console.log(`[prerender:debug] ${url} meta:`, helmet.meta?.toString()?.slice(0, 200));
      }
    }

    let out = template;

    // Inject the rendered React tree into the root div. We match the empty
    // placeholder Vite emits and replace it with the populated version.
    const ROOT_PLACEHOLDER = '<div id="root"></div>';
    if (!out.includes(ROOT_PLACEHOLDER)) {
      throw new Error(
        `template missing "${ROOT_PLACEHOLDER}". Did the index.html structure change?`,
      );
    }
    out = out.replace(ROOT_PLACEHOLDER, `<div id="root">${html}</div>`);

    // Merge helmet output into <head>. Helmet's per-page tags need to
    // OVERRIDE the base index.html versions, not duplicate them — duplicate
    // <title> tags and <meta name="description"> entries are a soft SEO
    // negative and can confuse non-JS crawlers. Strip the base versions for
    // every tag helmet will emit, then append helmet's.
    if (helmet) {
      const titleStr = helmet.title?.toString() ?? "";
      const metaStr = helmet.meta?.toString() ?? "";
      const linkStr = helmet.link?.toString() ?? "";
      const scriptStr = helmet.script?.toString() ?? "";

      // 1. If helmet provides a <title>, strip the base <title>...</title>.
      if (titleStr.includes("<title")) {
        out = out.replace(/\n?\s*<title>[\s\S]*?<\/title>/, "");
      }

      // 2. For each meta name/property helmet provides, strip matching
      //    metas from the base head. Match `name="X"` or `property="X"`.
      const metaIdentifierRegex = /(?:name|property)="([^"]+)"/g;
      const metaNamesProvided = new Set();
      let m;
      while ((m = metaIdentifierRegex.exec(metaStr)) !== null) {
        metaNamesProvided.add(m[1]);
      }
      for (const ident of metaNamesProvided) {
        // Match a single <meta ... name="ident" .../> or property="ident",
        // optionally with leading whitespace + newline. Conservative regex
        // avoids eating multiple tags.
        const safe = ident.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`\\n?\\s*<meta[^>]*(?:name|property)="${safe}"[^>]*/>`, "g");
        out = out.replace(re, "");
      }

      // 3. For each rel helmet provides on a <link>, strip matching link
      //    tags from base (e.g. canonical).
      const linkRelRegex = /rel="([^"]+)"/g;
      const linkRelsProvided = new Set();
      while ((m = linkRelRegex.exec(linkStr)) !== null) {
        linkRelsProvided.add(m[1]);
      }
      for (const rel of linkRelsProvided) {
        const safe = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`\\n?\\s*<link[^>]*rel="${safe}"[^>]*/?>`, "g");
        out = out.replace(re, "");
      }

      const headBlobs = [titleStr, metaStr, linkStr, scriptStr].filter(Boolean).join("\n    ");
      if (headBlobs) {
        out = out.replace("</head>", `    ${headBlobs}\n  </head>`);
      }

      const htmlAttrs = helmet.htmlAttributes?.toString();
      if (htmlAttrs) {
        out = out.replace(/<html\b[^>]*>/, (match) => match.replace(">", ` ${htmlAttrs}>`));
      }

      const bodyAttrs = helmet.bodyAttributes?.toString();
      if (bodyAttrs) {
        out = out.replace(/<body\b[^>]*>/, (match) => match.replace(">", ` ${bodyAttrs}>`));
      }
    }

    const destPath = path.join(DIST, outFile);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, out, "utf8");

    const bytes = Buffer.byteLength(out, "utf8");
    console.log(`[prerender] ${url.padEnd(8)} → ${outFile.padEnd(22)} ${bytes.toLocaleString()} B`);
  } catch (err) {
    failures += 1;
    console.error(`[prerender] FAILED for ${url}:`, err);
  }
}

// --- Cleanup --------------------------------------------------------------
// We don't need dist-server/ in the deployed output. Remove it so Lovable
// doesn't ship the server bundle to the CDN.
await fs.rm(DIST_SERVER, { recursive: true, force: true });

if (failures > 0) {
  console.error(`[prerender] ${failures} route(s) failed`);
  process.exit(1);
}
console.log(`[prerender] done — ${ROUTE_LIST.length} routes prerendered`);

// Several libs imported by the server bundle (Supabase auto-refresh in
// particular) install setInterval handles when their modules load. Those
// handles keep Node alive indefinitely even after we've finished. Force a
// clean exit.
process.exit(0);
