// Vite plugin: after the client build finishes, run a second SSR build
// and prerender public routes into dist/<route>/index.html.
//
// This lets Lovable's vanilla `vite build` produce fully prerendered HTML
// for crawlers (Google, GPTBot, ClaudeBot, PerplexityBot, LinkedIn, Slack)
// without needing the chained `npm run build` script.

import type { Plugin } from "vite";
import { build as viteBuild } from "vite";
import path from "node:path";
import fs from "node:fs/promises";

interface RouteEntry {
  url: string;
  outFile: string;
}

// Public, indexable routes only. Admin/auth/configurator/reference stay SPA.
const ROUTES: RouteEntry[] = [
  { url: "/", outFile: "index.html" },
  { url: "/work", outFile: "work/index.html" },
  { url: "/interested", outFile: "interested/index.html" },
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

// Minimal browser polyfills so libs that gate on localStorage still load.
function installSsrGlobals() {
  const noopStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
  if (typeof (globalThis as any).localStorage === "undefined") {
    (globalThis as any).localStorage = noopStorage;
  }
  if (typeof (globalThis as any).sessionStorage === "undefined") {
    (globalThis as any).sessionStorage = noopStorage;
  }
}

export function prerenderPlugin(): Plugin {
  let didRun = false;
  let isSsrBuild = false;

  return {
    name: "prerender-public-routes",
    apply: "build",
    configResolved(config) {
      isSsrBuild = !!config.build.ssr;
    },
    async closeBundle() {
      // Only run after the CLIENT build (skip the SSR build's own closeBundle,
      // and guard against re-entry).
      if (isSsrBuild || didRun) return;
      didRun = true;

      const root = process.cwd();
      const distDir = path.join(root, "dist");
      const distServerDir = path.join(root, "dist-server");
      const templatePath = path.join(distDir, "index.html");

      // Sanity check: client build must have written dist/index.html.
      try {
        await fs.access(templatePath);
      } catch {
        console.warn(`[prerender] skipped — ${templatePath} not found`);
        return;
      }

      console.log(`[prerender] starting SSR build...`);
      try {
        await viteBuild({
          root,
          logLevel: "warn",
          build: {
            ssr: "src/entry-server.tsx",
            outDir: "dist-server",
            emptyOutDir: true,
            rollupOptions: { input: "src/entry-server.tsx" },
          },
        });
      } catch (err) {
        console.error(`[prerender] SSR build failed:`, err);
        return;
      }

      installSsrGlobals();

      const serverEntry = path.join(distServerDir, "entry-server.js");
      try {
        await fs.access(serverEntry);
      } catch {
        console.error(`[prerender] SSR build output missing: ${serverEntry}`);
        return;
      }

      let serverModule: any;
      try {
        // Cache-bust in case Vite reuses module cache across builds.
        serverModule = await import(`${serverEntry}?t=${Date.now()}`);
      } catch (err) {
        console.error(`[prerender] failed to import server bundle:`, err);
        return;
      }

      if (typeof serverModule.render !== "function") {
        console.error(`[prerender] server bundle has no render() export`);
        return;
      }

      const template = await fs.readFile(templatePath, "utf8");
      const ROOT_PLACEHOLDER = '<div id="root"></div>';
      if (!template.includes(ROOT_PLACEHOLDER)) {
        console.error(`[prerender] template missing ${ROOT_PLACEHOLDER}`);
        return;
      }

      let failures = 0;
      for (const { url, outFile } of ROUTES) {
        try {
          const { html, helmet } = serverModule.render(url);
          let out = template.replace(ROOT_PLACEHOLDER, `<div id="root">${html}</div>`);

          if (helmet) {
            const titleStr = helmet.title?.toString() ?? "";
            const metaStr = helmet.meta?.toString() ?? "";
            const linkStr = helmet.link?.toString() ?? "";
            const scriptStr = helmet.script?.toString() ?? "";

            // Strip base <title> if helmet provides one.
            if (titleStr.includes("<title")) {
              out = out.replace(/\n?\s*<title>[\s\S]*?<\/title>/, "");
            }

            // Strip base <meta> tags whose name/property helmet overrides.
            const metaIdentifierRegex = /(?:name|property)="([^"]+)"/g;
            const metaNamesProvided = new Set<string>();
            let m: RegExpExecArray | null;
            while ((m = metaIdentifierRegex.exec(metaStr)) !== null) {
              metaNamesProvided.add(m[1]);
            }
            for (const ident of metaNamesProvided) {
              const safe = ident.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const re = new RegExp(
                `\\n?\\s*<meta[^>]*(?:name|property)="${safe}"[^>]*/>`,
                "g",
              );
              out = out.replace(re, "");
            }

            // Strip base <link> tags whose rel helmet overrides (canonical, etc).
            const linkRelRegex = /rel="([^"]+)"/g;
            const linkRelsProvided = new Set<string>();
            while ((m = linkRelRegex.exec(linkStr)) !== null) {
              linkRelsProvided.add(m[1]);
            }
            for (const rel of linkRelsProvided) {
              const safe = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const re = new RegExp(
                `\\n?\\s*<link[^>]*rel="${safe}"[^>]*/?>`,
                "g",
              );
              out = out.replace(re, "");
            }

            const headBlobs = [titleStr, metaStr, linkStr, scriptStr]
              .filter(Boolean)
              .join("\n    ");
            if (headBlobs) {
              out = out.replace("</head>", `    ${headBlobs}\n  </head>`);
            }

            const htmlAttrs = helmet.htmlAttributes?.toString();
            if (htmlAttrs) {
              out = out.replace(/<html\b[^>]*>/, (match) =>
                match.replace(">", ` ${htmlAttrs}>`),
              );
            }
            const bodyAttrs = helmet.bodyAttributes?.toString();
            if (bodyAttrs) {
              out = out.replace(/<body\b[^>]*>/, (match) =>
                match.replace(">", ` ${bodyAttrs}>`),
              );
            }
          }

          const destPath = path.join(distDir, outFile);
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.writeFile(destPath, out, "utf8");
          const bytes = Buffer.byteLength(out, "utf8");
          console.log(
            `[prerender] ${url.padEnd(12)} → dist/${outFile.padEnd(22)} ${bytes.toLocaleString()} B`,
          );
        } catch (err) {
          failures += 1;
          console.error(`[prerender] FAILED for ${url}:`, err);
        }
      }

      // Don't ship the server bundle to the CDN.
      await fs.rm(distServerDir, { recursive: true, force: true });

      if (failures > 0) {
        console.error(`[prerender] ${failures} route(s) failed`);
      } else {
        console.log(`[prerender] done — ${ROUTES.length} routes prerendered`);
      }
    },
  };
}
