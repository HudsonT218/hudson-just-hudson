## Summary
Update the About section body copy on the landing page (`src/pages/Index.tsx`). This is a pure content change — no layout, styling, or structure modifications.

## Changes

### 1. Replace About section body paragraphs
In the `<div className="space-y-5 text-gray-400 font-light leading-relaxed">` inside the About section (around line 182), replace the existing two `<p>` elements with three new paragraphs:

**Paragraph 1:**
> I build custom websites, AI tools, and software. I've spent serious time going deep on AI in particular: not just using it, but understanding what it can really do and how to build solid things with it. I care about making things that actually work, and I don't cut corners to get there.

**Paragraph 2:**
> You don't have to be technical to work with me. Maybe you know AI could help your business but the whole space just feels like noise. Maybe you've had an idea for months with no real path to building it. Maybe you need a proper website and the agency route felt overpriced and overcomplicated. Those are the people I do this for: you've got something worth building, and you need someone who can actually build it.

**Paragraph 3:**
> My role is to be the person who takes it all the way. I lead the project end to end, so you're not managing a developer or juggling freelancers. You bring the goal, I handle getting there. Working with AI lets me build faster and leaner than a traditional shop, which keeps your cost down, and I'd rather talk you out of a weak idea than bill you for one. I'm early in client work and price honestly because of it, which means real attention and a fair rate while I build my track record.

**Constraints:**
- No em-dash characters anywhere in the new copy.
- Keep all existing HTML structure, classes, labels, headlines, and links intact.
- Verify no TypeScript or build errors after the change.

### 2. Verify hero subtitle (already correct)
The hero subtitle under "Hudson Turansky" (lines 101-106) already matches the requested text exactly. No change needed there.