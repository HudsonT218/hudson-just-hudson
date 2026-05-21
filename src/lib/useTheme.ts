// Light/dark theme state for the public site.
//
// Source of truth: the `light` class on <html>. An inline script in
// index.html sets that class BEFORE first paint based on
// localStorage + prefers-color-scheme, so there's no flash of the
// wrong theme on cold load. This hook reads / writes the same class
// after hydration.
//
// Admin / configurator surfaces opt out via the `.dark-region` CSS
// class (see src/index.css). The toggle button in the Navbar only
// renders on public routes.

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "hudson-theme";

function readCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function subscribe(listener: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function useTheme(): { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    readCurrentTheme,
    () => "dark",
  );

  const setTheme = useCallback((next: Theme) => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", next === "light");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable, fail silently
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(readCurrentTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, toggle, setTheme };
}

// Helper for non-React modules (DottedSurface shader) that need to
// react to theme changes. Returns an unsubscribe.
export function onThemeChange(listener: (theme: Theme) => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(() => listener(readCurrentTheme()));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

// Re-export `readCurrentTheme` so callers can read once without
// subscribing.
export function getCurrentTheme(): Theme {
  return readCurrentTheme();
}

// Read a single CSS custom property as a number (used by shader
// uniforms in DottedSurface). Returns `fallback` if the variable
// isn't set or doesn't parse.
export function readCssVarFloat(name: string, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

