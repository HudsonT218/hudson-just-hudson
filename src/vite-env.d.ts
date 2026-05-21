/// <reference types="vite/client" />

// Injected by `define` in `vite.config.ts`. Captured once at build time so
// prerendered HTML and the hydrated client render the same year (avoids a
// hydration mismatch on December → January boundary).
declare const __BUILD_YEAR__: number;
