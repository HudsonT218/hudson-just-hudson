// Force dark mode on routes that have dark-only styling or host Radix
// portals (Sheet, Dialog, Popover) that render outside the page's
// `.dark-region` wrapper.
//
// Admin / configurator / reference pages are dark by design. The
// `.dark-region` CSS class restores dark styling inside the wrapper, but
// Radix portals mount as direct children of <body>, bypassing the
// wrapper entirely. The cleanest fix is to remove the `light` class from
// <html> while these pages are mounted — then the global default (dark)
// applies everywhere, portals included.
//
// Coordinates with `index.html`'s pre-paint script (which already skips
// applying `light` for these paths on cold load) and `useTheme()` (which
// reads / writes the class via MutationObserver and is happy to see it
// disappear).

import { useEffect } from "react";

const STORAGE_KEY = "hudson-theme";

function getPreferredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable, fall through to OS preference
  }
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function useForceDark() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.classList.remove("light");
    return () => {
      // Restore based on the user's persisted preference rather than
      // whatever the class state was at mount, so cold-loading directly
      // to an admin URL in light mode still restores light mode when the
      // user navigates back to the public site.
      if (getPreferredTheme() === "light") {
        html.classList.add("light");
      }
    };
  }, []);
}
