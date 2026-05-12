# AI Meeting Assistant Demo — Iteration 2

Replace the scenario data in `src/components/meeting-assistant-demo/scenario.ts` so the script reads like an actual back-and-forth meeting between Maya and Jordan, with the AI as a silent observer that catches claims — not a Q&A bot the humans are interrogating.

## Changes

**File: `src/components/meeting-assistant-demo/scenario.ts`**

- **Context array**: unchanged (same 9 documents).
- **Transcript**: replace with 23 lines where Jordan attempts answers (sometimes wrong/vague) before the AI surfaces the precise version, then Maya reacts. New runtime ~76s.
- **Annotations**: same 9 cited annotations as iteration 1, only `fireAt` offsets change to match the new transcript timing.
- **durationSec**: 80.

## What's NOT changing

- `MeetingAssistantDemo.tsx` — no UI or animation changes.
- `usePlayback.ts` — no timing constant changes.
- Hero context loader, auto-start, replay, auto-scroll, mobile inline annotations — all unchanged.
- Branding stays "AI meeting assistant" — no "Echo" reintroduced.

## Acceptance

- Demo plays through 23 transcript lines + 9 annotations in ~80s.
- Left transcript pane height roughly matches right annotation pane by end of playback.
- Script reads as humans talking to each other, AI quietly fact-checking.
- No regressions on existing demo behavior.