## Change

Replace the single subtitle paragraph in `src/pages/WorkPage.tsx` (lines 264–267) with two distinct paragraphs.

### Before
```tsx
<p className="text-lg text-gray-400 font-light mt-4 max-w-2xl">
  A second AI model thinks alongside the meeting — fact-checking claims and
  surfacing answers from pre-loaded context, all with citations.
</p>
```

### After
```tsx
<p className="text-lg text-gray-400 font-light mt-4 max-w-2xl">
  Before the meeting, the assistant reads in a stack of company documents — reports, dashboards, contracts, market feeds. During the meeting, one model transcribes the conversation in real time while a second model runs silently in the background, cross-referencing what's said against the loaded context. When it catches a misstated number, an unanswered question, or a piece of relevant context no one raised, it drops a note with a citation back to the source. The conversation flows uninterrupted.
</p>
<p className="text-lg text-gray-300 font-light mt-4 max-w-2xl">
  This is one example of a custom AI assistant I can build for your team.
</p>
```

Same typography size/font/max-width as the current subtitle. Second paragraph uses `text-gray-300` (slightly brighter than `text-gray-400`) for subtle emphasis, with normal `mt-4` paragraph spacing. No other files touched.

## Out of scope

LIVE DEMO eyebrow, heading, demo container, post-demo description, "Interested in working together?" section — all unchanged.
