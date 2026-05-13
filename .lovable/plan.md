## Phase D — Real Collaborators section on /work

### 1) New file: `src/components/Collaborators.tsx`

Client component, fetches on mount via `useEffect` + `useState`. No react-query (matches existing simple data fetch patterns on the public site).

```tsx
const [refs, setRefs] = useState<PublicApprovedReference[] | null>(null);
useEffect(() => {
  listApprovedReferencesPublic()
    .then(setRefs)
    .catch(() => setRefs([]));
}, []);
if (!refs || refs.length === 0) return null;
```

Render the `<section id="references">` exactly per spec, mapping rows → `<ReferenceCard>`. Cards use a 1/2/3 column responsive grid.

**`ReferenceCard` (same file)** — shares card chrome with WorkPage capability cards (`rounded-2xl`, `bg: rgba(255,255,255,0.02)`, `border: 1px solid rgba(255,255,255,0.05)`, `p-6`).

Layout:
- Top: blockquote with a 2px blue accent bar on the left (`border-l-2 border-blue-400/60 pl-4`), `text-base text-gray-300 italic leading-snug`.
- Spacer + `border-t border-white/[0.05]` divider.
- Bottom row: flex justify-between, left = name (`text-white font-semibold text-sm`) over role_title (`text-gray-500 text-xs`); right = if `linkedin_url`, a `Linkedin` lucide icon (size 16, `text-gray-500 hover:text-blue-400`) wrapped in `<a target="_blank" rel="noopener noreferrer">`.

### 2) Edit `src/pages/WorkPage.tsx`

- Replace `import SocialProof from "@/components/SocialProof";` with `import Collaborators from "@/components/Collaborators";`.
- Replace `<SocialProof />` (line 267) with `<Collaborators />`. Keep the surrounding dividers — `Collaborators` returns `null` when empty so the section vanishes cleanly; the dividers remain but stack harmlessly.

### 3) Delete `src/components/SocialProof.tsx`.

### Out of scope
Admin pages, configurator, ReferencePage, edge functions, DB.

### Sanity check
The `approved_references_public` view is read by `listApprovedReferencesPublic()` — `references` table already has a `public read approved references` RLS policy, so anon clients can read approved rows. Insert one approved row directly to verify before the full invite→submit→approve flow.
