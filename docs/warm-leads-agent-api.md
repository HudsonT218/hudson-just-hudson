# Warm Leads — Local Agent API

Contract for any browser-using agent (Hermes on Hudson's PC, or any future
client) that wants to push leads into the warm-leads inbox.

## Auth

All requests need a Bearer token in the `Authorization` header. The token is
the value of the `AGENT_API_KEY` secret in Supabase Edge Function settings.

```
Authorization: Bearer <AGENT_API_KEY>
```

Set the secret once in the Supabase dashboard (or via Lovable Cloud → Edge
Function Secrets). Use any high-entropy random string — at least 32 bytes,
base64 or hex.

Requests without a valid Bearer token get `401 Unauthorized`.

## Base URL

```
https://<project-ref>.supabase.co/functions/v1
```

(Or whatever the Supabase project's functions hostname is.)

## Endpoints

### 1. GET /agent-config

Called at the start of each run to pick up keywords, target, threshold, and
whether the master toggle is on. Hermes should respect `automation_enabled`
and `source_enabled` — if either is false, bail out without pushing anything.

**Request:**

```
GET /functions/v1/agent-config?source_id=linkedin
Authorization: Bearer <AGENT_API_KEY>
```

**Response (200):**

```json
{
  "automation_enabled": true,
  "source_id": "linkedin",
  "source_enabled": true,
  "source_kind": "local_agent",
  "keywords": [
    "need a website for my",
    "looking for a web designer",
    "small business owner looking",
    "looking to redesign",
    "ai for my business",
    "automate my business",
    "anyone build websites"
  ],
  "target_per_run": 5,
  "threshold": 60,
  "outreach_voice": "I'm Hudson, an indie developer who builds..."
}
```

**Errors:**

- `401` — bad/missing Bearer
- `404` — `source_unknown` (source_id doesn't exist)
- `400` — `missing_param` (no source_id query string)

### 2. POST /intake-warm-lead

Called once per candidate the agent thinks looks like a warm lead. The
server scores + drafts + de-dupes + inserts. Each response tells the agent
whether the lead was accepted; the agent counts accepted responses and
stops at `target_per_run`.

**Request:**

```
POST /functions/v1/intake-warm-lead
Authorization: Bearer <AGENT_API_KEY>
Content-Type: application/json

{
  "source_id": "linkedin",
  "external_id": "linkedin:activity-7218394283…",
  "url": "https://linkedin.com/posts/...",
  "author_handle": "janedoe",
  "author_display_name": "Jane Doe",
  "posted_at": "2026-05-22T14:00:00Z",
  "raw_title": null,
  "raw_excerpt": "Hey LinkedIn, I run a small bakery in Brooklyn and...",
  "matched_keywords": ["need a website for my"]
}
```

**Required fields:** `source_id`, `external_id`, `url`, `raw_excerpt`.

**`external_id` format:** stable per-source ID for de-dup across runs. For
LinkedIn, use the post activity URN. Same URL submitted twice returns
`reason: "duplicate"`.

**Response — accepted (200):**

```json
{
  "accepted": true,
  "lead_id": "<uuid>",
  "score": 73,
  "draft": "Sounds like you need a small-business site that..."
}
```

**Response — rejected (200, still HTTP 200 — see `accepted: false`):**

```json
{
  "accepted": false,
  "reason": "below_threshold",
  "score": 42
}
```

**Possible rejection reasons:**

| Reason                    | Meaning                                                 |
| ------------------------- | ------------------------------------------------------- |
| `automation_off`          | Master toggle is off. Stop the run, retry later.        |
| `source_disabled`         | This source's toggle is off. Stop the run, retry later. |
| `source_unknown`          | `source_id` doesn't match any row.                      |
| `source_not_local_agent`  | Source is cloud-managed, not a local-agent source.      |
| `duplicate`               | Already in the inbox (`lead_id` returned).              |
| `below_threshold`         | Scored below `threshold`. Try a different candidate.    |

**HTTP errors:**

- `401` — bad/missing Bearer
- `400` — `missing_fields` or `invalid_json`
- `405` — wrong method (must be POST)
- `500` — DB or LLM failure (transient — retry with backoff)

## Suggested Hermes loop

```
config = GET /agent-config?source_id=linkedin
if not config.automation_enabled or not config.source_enabled:
    exit early

opened_browser_to_linkedin()
accepted_count = 0

while accepted_count < config.target_per_run:
    candidate = find_next_promising_post(config.keywords)
    if candidate is None:
        break  # out of leads in feed

    pace_like_a_human()  # random delay, occasional non-extract action

    response = POST /intake-warm-lead with candidate
    if response.accepted:
        accepted_count += 1
    elif response.reason in ("automation_off", "source_disabled"):
        break  # toggle flipped mid-run, stop
    # else: below_threshold or duplicate — keep going
```

## Operational notes

- The server is the sole scorer. Hermes can pre-filter on local heuristics
  but should submit any post that looks plausible — the LLM on the server
  is the authoritative judge.
- `outreach_voice` is returned for Hermes's reference; drafting still
  happens server-side using the persisted value.
- The intake endpoint stamps `last_run_at` on the source row on every
  accepted lead. So the admin UI shows the source ticking even if the
  agent's run is long.
- The contract is single-tenant for now. If this gets productized, the
  `AGENT_API_KEY` env var gets replaced by a hashed-key table with per-key
  scoping. The endpoint shapes stay the same.
