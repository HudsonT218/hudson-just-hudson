## Remove em dashes from /free-build copy

Rewrite all user-visible text in `src/pages/FreeBuildPage.tsx` to eliminate `—` (em dash). Code comments are left as-is.

### Edits

**L11** — Skeleton counter
- Before: `"— free spots left"`
- After: `"... free spots left"`

**L58 & L159** — Full state message
- Before: `All N spots are currently full — join the waitlist`
- After: `All N spots are currently full. Join the waitlist.`

**L74, L83, L92** — Meta descriptions
- Before: `A limited batch of free builds — websites, AI tools, automations. No payment, no catch.`
- After: `A limited batch of free builds: websites, AI tools, and automations. No payment, no catch.`

**L141-142** — Hero paragraph
- Before: `...free builds — websites, AI tools, automations — to do great work and let it speak for itself.`
- After: `...free builds across websites, AI tools, and automations. The goal is to do great work and let it speak for itself.`

**L308** — Booking section
- Before: `somewhere — they just can't point at exactly what.`
- After: `somewhere, they just can't point at exactly what.`

**L388** — Step description
- Before: `We talk through your business — how it runs, where the friction is.`
- After: `We talk through your business: how it runs, and where the friction is.`

**L393** — Step description
- Before: `I'll pin down a project worth doing — and tell you honestly if AI isn't the answer.`
- After: `I'll pin down a project worth doing, and tell you honestly if AI isn't the answer.`

**L571** — Form placeholder
- Before: `Describe it if you know — or leave this blank, that's completely fine.`
- After: `Describe it if you know, or leave this blank. That's completely fine.`

Code-only em dashes inside `style={{ ... "var(--...)" }}` and comments are not text and are left untouched.