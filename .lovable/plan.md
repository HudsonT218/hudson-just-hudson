# Admin design-token layer

Scope is limited to three files under `src/pages/admin/_components/`. No restyling of pages, no dependency changes, no edits to data layer.

## 1. New: `src/pages/admin/_components/theme.ts`

Exports a typed `admin` token object and a `LEAD_STATUS_COLORS` map.

```ts
import type { LeadStatus } from "@/lib/lead-os-types";

export const admin = {
  bg: "#09090b",
  surface: "rgba(255,255,255,0.02)",
  surface2: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "#ffffff",
  textMuted: "rgb(156,163,175)",
  textDim: "rgb(107,114,128)",
  accent: "#3b82f6",
  accentSoft: "rgba(59,130,246,0.15)",
} as const;

export type AdminTheme = typeof admin;

export const LEAD_STATUS_COLORS: Record<LeadStatus, { dot: string; soft: string }> = {
  cold:   { dot: "rgb(156,163,175)", soft: "rgba(255,255,255,0.06)" },
  warm:   { dot: "#60a5fa",          soft: "rgba(59,130,246,0.15)" },
  client: { dot: "#34d399",          soft: "rgba(16,185,129,0.15)" },
  dead:   { dot: "rgb(252,165,165)", soft: "rgba(127,29,29,0.25)" },
};
```

Values for `LEAD_STATUS_COLORS` are sourced from the current `LEAD_COLORS` block in `StatusBadge.tsx` (bg → `soft`, fg → `dot`).

## 2. New: `src/pages/admin/_components/ui.tsx`

Reusable primitives, all built from `theme.ts`. No new deps; uses existing `cn` from `@/lib/utils` and any already-installed `lucide-react` icon types only via the optional `icon` prop typed as `ReactNode`.

Components:
- **SectionLabel** — `<div>` with `text-[10px] uppercase font-medium tracking-[0.14em]`, color `admin.textDim`. Props: `children`, optional `icon?: ReactNode` (leading), optional `count?: number` (trailing, dimmer).
- **AdminCard** — `<div>` with `rounded-2xl p-5` (configurable `className`), background `admin.surface`, `1px solid admin.border`.
- **AdminPageHeader** — flex row, title left (large white text), `actions?: ReactNode` slot right.
- **SegmentedToggle<T extends string>** — controlled pill segmented control. Props: `options: { value: T; label: string }[]`, `value: T`, `onChange(v: T)`. Active pill uses `admin.surface2` + white text; inactive uses `admin.textMuted`.
- **StatusDot** — 8px round dot. Props: `status: LeadStatus`, looks up `LEAD_STATUS_COLORS[status].dot`.
- **GhostButton** — `<button>` transparent, hover background `admin.surface2`, text `admin.text`. Forwards all standard button props.
- **EmptyState** — centered `<div>` with muted text (`admin.textMuted`), accepts `children` (and optional `icon`).

All visual values resolved via inline `style` referencing `admin.*` tokens (matches the existing inline-style pattern in `AdminLayout.tsx`).

## 3. Edit: `src/pages/admin/_components/StatusBadge.tsx`

- Remove the local `LEAD_COLORS` constant.
- Import `LEAD_STATUS_COLORS` from `./theme`.
- Update `LeadStatusBadge` to read `LEAD_STATUS_COLORS[status].soft` / `.dot` in place of the previous `bg`/`fg`.
- Leave `PROJECT_COLORS`, `PROJECT_TYPE_COLORS`, reference colors, and all other badges untouched.

Net visual diff: zero.

## Verification

- No other files modified.
- No new dependencies.
- Token values produce identical pixel output to current `LEAD_COLORS` (verified value-by-value).
- TypeScript: `LEAD_STATUS_COLORS` typed via `Record<LeadStatus, …>` so any future status addition is a compile error; `SegmentedToggle` is generic over the value type.
