## Match `/free-build` text sizing to the home page

The home page uses `text-3xl sm:text-4xl font-extrabold` for section headings (e.g. "I'm a builder."). The `/free-build` hero is currently `text-4xl sm:text-5xl md:text-6xl font-bold`, which makes it dramatically larger than anything on the rest of the site.

### Changes (all in `src/pages/FreeBuildPage.tsx`)

1. **Hero heading** ("I'm building 20 projects for free.") — line 128
   - From: `text-4xl sm:text-5xl md:text-6xl font-bold`
   - To: `text-3xl sm:text-4xl font-extrabold`

2. **Hero subhead paragraph** — line 138
   - From: `text-lg sm:text-xl font-light`
   - To: `text-base sm:text-lg font-light` (matches home body copy weight/size)

3. **Counter "17 of 20 free spots left"** — line 157
   - From: `text-2xl sm:text-3xl font-semibold`
   - To: `text-xl sm:text-2xl font-semibold` (one step smaller so it sits below the new, smaller H1)

4. **Success card heading** ("You're in.") — line 659
   - From: `text-3xl sm:text-4xl font-bold`
   - To: `text-3xl sm:text-4xl font-extrabold` (just weight, to match home)

No other size changes. Section subheads (`text-2xl sm:text-3xl font-semibold` for "How it works", "What you get", "Apply" etc.) already sit reasonably with the home page's secondary headings and are left alone to preserve hierarchy on this dense page.

No layout, copy, color, or component-structure changes.
