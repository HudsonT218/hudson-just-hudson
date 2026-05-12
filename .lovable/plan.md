## 1. Update `/work` portfolio cards (`src/pages/WorkPage.tsx`)

In `PORTFOLIO_ITEMS`:
- Remove the `AI · 2026` "Project coming soon" card.
- Replace the Software card with:
  - `label: "Software · 2026"`
  - `title: "Food Bank Volunteer OS"`
  - `desc: "Custom backend software I'm building for a food bank — shift scheduling, volunteer hour tracking, leaderboards, manager dashboards. Coming soon."`
- Keep the muted/dashed "coming soon" treatment (no `url`, no `image`).

Grid: change `md:grid-cols-3` → `md:grid-cols-2` so two cards sit side-by-side intentionally. Keep the `gap-4` and existing card styling.

## 2. New Echo demo section

Inserted between the portfolio section and the existing "Interested in working together?" CTA in `WorkPage.tsx`. Full-width, dark, matches existing section rhythm (`py-28 px-6`, `max-w-5xl mx-auto`, blue eyebrow + extrabold heading + tagline gray-400).

Heading: **Echo — an AI agent I built**
Tagline: *A second AI model thinks alongside the meeting — fact-checking claims and surfacing answers from pre-loaded context, all with citations.*

Below the demo container, a single muted left-aligned paragraph:
> A scripted walkthrough of a Q4 review meeting at a fake SaaS company. The demo isn't connected to a live LLM — it's a faithful recreation of a prototype I built and previously deployed. I'd build a real version for you.

## 3. Echo demo component

New folder `src/components/echo-demo/`:

- `scenario.ts` — exact data from spec (types + scenario const).
- `usePlayback.ts` — playback state machine: `idle-pre` → `playing` → `idle-post`. Drives `currentTime` via `requestAnimationFrame`, exposes `revealedTranscriptIds`, `revealedAnnotationIds`, `pendingAnnotationId` (for the ~600ms thinking pulse before reveal), `start()`, `replay()`. Holds `playing` until `scenario.durationSec` (60s), then flips to `idle-post`.
- `useAutoScroll.ts` — observes a sentinel at the bottom of the demo container; smoothly scrolls window to keep it in view while playing. Detects user `wheel`/`touchmove`/`keydown` to set `isPaused = true`; exposes `catchUp()` that re-enables and snaps to sentinel. Clamps so it never scrolls past the demo's own bottom edge (CTA section stays visible).
- `EchoDemo.tsx` — main component, composes everything.

### EchoDemo.tsx layout

Single rounded dark container (`rounded-2xl`, subtle border + bg matching existing cards). Inside:

**Title bar** — three colored dots (red/yellow/green), title text (`Q4 Review · Recording` while playing, `Q4 Review · Idle` otherwise; short fade-cross on change), right side: `● Live` (red dot, 2s ease-in-out infinite pulse, only animates while `playing`) + `Replay` button (more prominent in `idle-post`).

**Context strip** — horizontal flex of pills (`✓ {name}`). In `idle-pre` they appear one-by-one at 250ms intervals on mount/in-view (IntersectionObserver). Once all loaded, status text reads `Ready` and a prominent `▶ Start demo` button shows. When transitioning to `playing` the panel collapses into a compact strip pinned at top.

**Body**:
- Desktop (`md:` and up): two columns.
  - Left "Transcript" pane: mic icon + label, then revealed `TranscriptEntry` components. Each: small circular avatar with speaker initial (M / J), muted speaker name, then the line. On reveal: container fades in (~150ms) while text types char-by-char over 400–600ms scaled to length.
  - Right "Echo · agent notes" pane: sparkle icon + label, then `AnnotationCard`s. When an annotation's `fireAt` hits, show a shimmer/`···` placeholder for ~600ms in the pane, then card fades in (~250ms).
- Mobile (`< md`): single column. Each annotation renders inline directly under the transcript entry that triggered it (matched by largest `t.startAt <= a.fireAt`). Same card styling.

**AnnotationCard**: rounded subtle-bg card, top: small uppercase badge (`CLAIM CHECK` yellow / `QUESTION ANSWERED` cyan / `INSIGHT` purple — using accent backgrounds w/ matching text), then annotation text in default color, then citation chip below: subtle bg, mono-ish font, format `📄 {source} · {locator}`. Looks clickable, no handler.

**Container growth**: framer-motion `<motion.div layout>` on the body (and on the transcript/annotation lists) for smooth height transitions. A sentinel `<div ref>` at the bottom feeds `useAutoScroll`.

**Catch-up pill**: when `useAutoScroll.isPaused && playing`, render a fixed `bottom-6 right-6` rounded pill `▼ Catch up` that calls `catchUp()` on click.

### Timing

- All timing keyed off `currentTime` from `usePlayback`.
- Transcript entry revealed when `currentTime >= startAt`. Typing animation handled inside the entry component (own `useEffect` slicing text on a 400–600ms timer once revealed).
- Annotation: `pendingAnnotationId` set 0.6s before `fireAt` (or at `fireAt` then card delayed 0.6s — simpler: at `fireAt` show pulse, after 600ms swap to card). State stored per-id so replay works.

## 4. Constraints honored

- Only edits `src/pages/WorkPage.tsx` and adds `src/components/echo-demo/*`.
- Uses existing deps (`framer-motion` 12 already in `package.json`, Tailwind, shadcn). No new packages.
- No backend, no LLM, no audio. Fully scripted.
- Existing CTA section + theme tokens untouched.
- No new READMEs/comments beyond non-obvious why.

## Acceptance check before finishing

- `/work` shows 2 cards in a 2-col grid.
- Echo section renders with idle-pre → playing → idle-post flow, replay works.
- Auto-scroll follows demo bottom; manual scroll pauses + shows Catch up pill; never scrolls past demo bottom.
- Mobile: annotations inline under triggering transcript entry.
- No console errors; CTA section unchanged and visible after demo.
