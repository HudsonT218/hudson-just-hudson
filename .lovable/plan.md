## Plan: Replace "Software · 2026" placeholder with Chesapeake Community Pantry card

**File:** `src/pages/WorkPage.tsx` (lines 42-46)

**Steps:**
1. Copy uploaded screenshot to `src/assets/chesapeake-pantry.png` and import as `chesapeakePantryCover`.
2. Replace the placeholder portfolio item with a live card matching the Happy Tails pattern:
   ```ts
   {
     label: "Software · 2026",
     title: "Chesapeake Community Pantry",
     desc: "An example volunteer tracking OS I built — shift scheduling, hour tracking, leaderboards, and manager reports for a food bank.",
     url: "https://chesapeake-pantry.lovable.app",
     image: chesapeakePantryCover,
   }
   ```

**Out of scope:** other cards, layout, capabilities section, Work.tsx (not used on /work).