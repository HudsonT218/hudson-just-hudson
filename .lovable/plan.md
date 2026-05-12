# AI Meeting Assistant Demo — Iteration 1

Three changes to the existing demo on `/work`: drop the "Echo" brand, ~2× faster timing with an extended script, and auto-start on scroll-in with a hero context-loading panel.

## 1. Strip the "Echo" brand

**Folder/file rename**
- `src/components/echo-demo/` → `src/components/meeting-assistant-demo/`
- `EchoDemo.tsx` → `MeetingAssistantDemo.tsx`
- Component export `EchoDemo` → `MeetingAssistantDemo`
- Keep `scenario.ts`, `usePlayback.ts`, `useAutoScroll.ts` filenames; rewrite their internals as needed.
- Update import + JSX usage in `src/pages/WorkPage.tsx`.

**UI string changes (in `WorkPage.tsx`)**
- Section heading: `Echo — an AI agent I built.` → `AI meeting assistant I built.`
- Tagline: `A second AI model thinks alongside the meeting — fact-checking claims and surfacing answers from pre-loaded context, all with citations.`
- Description block: replace any "Echo" mention with "this meeting assistant".

**UI string changes (in component)**
- Right pane header `ECHO · AGENT NOTES` → `AGENT NOTES`.
- Status text: `Echo is thinking` → `Thinking…`; `Echo is ready` → `Ready`.

**Internals**
- Variables/CSS classes containing `echo` → `assistant` / `meetingAssistant`.
- Strip any `// Echo …` comments.

Verification: `git grep -i echo src/` returns nothing in component code, scenario data, or rendered strings.

## 2. Speed up ~2× and extend script

**Timing constants** (in `MeetingAssistantDemo.tsx` / `usePlayback.ts`)
- Transcript typewriter: clamp `200–300ms` (was 400–600).
- Annotation thinking pulse: `PULSE_LEAD = 0.3` (was 0.6).
- Annotation card fade-in: `0.15s` (was 0.25).
- Container/layout transitions: `0.15s` (was ~0.3).
- Context card stagger in hero: keep `~250–300ms`.

**Replace `scenario.ts` data** with the exact constant from the user's spec: 9 context docs, 13 transcript lines (last at 49s), 9 annotations (last at 46.5s), `durationSec: 55`. Type aliases (`TranscriptEntry`, `Annotation`, `AnnotationType`) stay the same.

## 3. Auto-start on scroll-in + hero context loader

**Playback state machine (`usePlayback.ts`)**
- Add states: `idle-pre` → `loading-context` → `transitioning` → `playing` → `idle-post`.
- `start()` runs context cards (one every ~280ms; `~2.5s` total) → holds `Ready — starting meeting` for `700ms` → collapses hero (`400ms`) → begins timeline.
- `replay()` resets to `idle-pre` and re-runs the full flow including hero.
- Track `hasAutoStarted` ref so auto-start fires only once per page load.

**Auto-start (in `MeetingAssistantDemo.tsx`)**
- `IntersectionObserver({ threshold: 0.5 })` on container ref. On first intersection AND `state === "idle-pre"` AND `!hasAutoStarted`, call `start()`. Disconnect after firing.
- Remove the existing ▶ Start demo button entirely.

**Hero context-loading panel (replaces idle-pre body and the strip during loading)**
- Eyebrow: `PRE-MEETING CONTEXT`.
- Status line: `9 documents · 2,840 KB · ready in 1.8s`.
- Grid of 9 document cards:
  - Desktop ≥1024px: `lg:grid-cols-3`
  - Tablet 640–1024: `sm:grid-cols-2`
  - Mobile: `grid-cols-1`
- Card content:
  - Icon by extension (lucide: `FileText` for `.pdf`, `FileSpreadsheet` for `.csv`, `FileType` for `.docx`, `Rss`/`Globe` for `competitor-tracking`).
  - Filename in readable size (`text-sm` not `text-[11px]`).
  - Pre-load: subtle pulse / `Loader2` spin (~300ms) → swap to green `Check`.
- Cards reveal one-by-one at ~280ms intervals. Helper `getDocIcon(name)` keyed off filename extension.
- Status line under grid cycles: `Reading…` (cards 1–3) → `Indexing…` (cards 4–8) → `Ready — starting meeting` (after card 9).

**Collapse transition**
- After hero completes, animate the hero panel `height/opacity` out (~400ms via framer-motion), then mount the existing two-pane transcript/notes layout. The compact top strip (existing pill row with green checks) remains as the "loaded context" indicator at top.
- During `playing`/`idle-post` the top strip behaves exactly as before.

**Replay** triggers the same full sequence (cards re-reveal one-by-one).

## Files touched

- Rename: `src/components/echo-demo/` → `src/components/meeting-assistant-demo/`
- Edit: `MeetingAssistantDemo.tsx` (new name; logic + UI changes)
- Edit: `usePlayback.ts` (new states + faster constants)
- Edit: `useAutoScroll.ts` (no functional change beyond renaming if needed)
- Edit: `scenario.ts` (replace data; rename string values not filenames)
- Edit: `src/pages/WorkPage.tsx` (import path, component name, heading/tagline/description copy)

No new dependencies. No backend or routing changes. CTA section below the demo and all other pages untouched.

## Acceptance check

- `git grep -i echo src/` returns nothing.
- Demo auto-plays once on first scroll-in; no Start button in DOM.
- Hero shows 9 cards in grid with icons + check animation; collapses into top strip.
- 13 transcript lines + 9 annotations play through ~55s; animations visibly faster.
- Replay re-runs hero + meeting.
- Auto-scroll/pause/Catch-up + mobile inline annotations behavior unchanged.
