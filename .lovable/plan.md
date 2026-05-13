## Public Reference Form — Phase C

### 1) New file: `src/pages/ReferencePage.tsx`

Single-purpose dark page (no Navbar) styled after `InterestedPage.tsx`.

**Helmet**
- `<title>Write a reference for Hudson Turansky</title>`
- `<meta name="robots" content="noindex" />`

**State machine**
```ts
type State = 'loading' | 'invalid' | 'form' | 'submitting' | 'success' | 'submit_error';
type InvalidReason = 'invalid' | 'expired' | 'already_submitted' | 'revoked';
```

**On mount** — read `:token` via `useParams()`, call:
```ts
supabase.functions.invoke('verify-reference-access', { body: { token } })
```
- Valid → `state='form'`, store invited_email for client-side match hint.
- Otherwise → `state='invalid'` with reason from response.

**Loading state** — centered subtle "Loading…" text matching `PageFallback` style.

**Invalid state** — centered `rounded-2xl` card (same border/bg as InterestedPage cards: `rgba(255,255,255,0.02)` bg, `rgba(255,255,255,0.05)` border) with reason-specific copy, plus muted mailto link to `hudsonturansky@gmail.com`.

**Form state**
- Hero block (matching InterestedPage hero): radial gradient bg, eyebrow `"Reference"` (blue-400 uppercase tracking-widest), H1 `Write a reference for Hudson.` with gradient on `Hudson.` (`linear-gradient(135deg, #3b82f6, #8b5cf6)`), subtext `"Just a few fields. Should take 2 minutes."`
- Form card: `max-w-xl mx-auto`, `rounded-2xl p-8`, same bg/border tokens as InterestedPage cards. Fields use shadcn `<Input>` / native `<textarea>` styled to match.
  1. Your name — required, maxLength 80
  2. Your email — required, format-validated, helper "Must match the email this link was sent to."
  3. Your role / title — required, maxLength 80, helper about display
  4. One-line summary — `<textarea rows={3}>`, required, maxLength 140, live `{n}/140` counter (turns amber > 120, red at 140)
  5. LinkedIn URL — optional
- Submit button: `Send Reference →`, full-width on mobile (`w-full sm:w-auto sm:ml-auto`), white bg / dark text matching the Calendly CTA on InterestedPage. Disabled until: name && role_title && headline && headline.length ≤ 140 && email regex passes.
- Inline error block (red text inside the card) shown when `state='submit_error'`.
- Small muted mailto to `hudsonturansky@gmail.com` beneath card: "Questions? Email Hudson."

**On submit**
```ts
state='submitting';
const { data, error } = await supabase.functions.invoke('submit-reference', {
  body: { token, name, role_title, email, headline, linkedin_url: linkedin_url || null }
});
```
- Success → `state='success'`.
- Error → `state='submit_error'`, surface server message (e.g. "Email doesn't match invite") inline, re-enable form.

**Success state** — replaces form: centered card, H2 `"Thanks!"`, body `"Your reference is in. Hudson will review and publish it shortly. Feel free to close this tab."`

### 2) Edit `src/App.tsx`

- Add lazy import:
  ```ts
  const ReferencePage = lazy(() => import("./pages/ReferencePage.tsx"));
  ```
- Add route in the public section (after `/interested`, before configurator block, NOT wrapped in `ConfiguratorBoundary`):
  ```tsx
  <Route path="/reference/:token" element={<Suspense fallback={<PageFallback />}><ReferencePage /></Suspense>} />
  ```
- DottedSurface stays visible (route is not in `CONFIGURATOR_PREFIXES`) — matches the focused-but-branded feel.

### Out of scope
No Navbar on the page. No changes to admin pages, configurator, edge functions, or DB.

### Sanity checks after build
- `/reference/<bad-token>` → invalid card.
- `/reference/<valid-token>` → form renders, submit hits `submit-reference`, success card replaces form.
