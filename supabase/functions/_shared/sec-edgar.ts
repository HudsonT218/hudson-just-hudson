// SEC EDGAR helper — ticker → CIK → latest filing → cleaned text.
//
// All SEC endpoints used here are free and require no API key. SEC's fair-access
// policy DOES require a descriptive User-Agent with a real contact (set via the
// SEC_USER_AGENT secret, with a sensible hudsonturansky.com default).
//
//   1. company_tickers.json      → maps a ticker symbol to its CIK.
//   2. submissions/CIK#.json     → lists a company's recent filings.
//   3. Archives/edgar/data/...   → the primary filing document (inline-XBRL HTML).
//
// The cleaner strips inline-XBRL plumbing (<ix:header>, hidden contexts), tags,
// scripts/styles, and HTML entities, leaving readable prose + financial tables
// that the LLM can summarize. Output is capped (MAX_FILING_CHARS) so a large
// 10-K can't blow up the LLM request; callers get a `truncated` flag.
//
// This module is typed (no @ts-nocheck) and depends only on `fetch`, `Deno.env`,
// and standard string APIs — all available in the Supabase edge runtime.

export const MAX_FILING_CHARS = 120_000;

const TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
const SUBMISSIONS_BASE = "https://data.sec.gov/submissions";
const ARCHIVES_BASE = "https://www.sec.gov/Archives/edgar/data";

// Forms the tool understands. "latest" resolves to the most recent 10-K or 10-Q.
export type FilingForm = "latest" | "10-K" | "10-Q";
export const SUPPORTED_FORMS: FilingForm[] = ["latest", "10-K", "10-Q"];

export interface FilingMeta {
  ticker: string;
  cik: string; // zero-padded 10-digit, e.g. "0000320193"
  company: string;
  form: string; // the actual form fetched, e.g. "10-Q"
  requestedForm: FilingForm;
  filingDate: string; // YYYY-MM-DD
  reportDate: string; // YYYY-MM-DD (period end), may be ""
  accessionNumber: string;
  primaryDocument: string;
  sourceUrl: string; // human-viewable link to the document on sec.gov
  truncated: boolean;
}

export interface FetchedFiling {
  meta: FilingMeta;
  text: string; // cleaned plain text
}

// Typed error so the caller can map a failure to the right user-facing message
// and HTTP status WITHOUT consuming one of the user's free runs.
export type FilingErrorCode =
  | "invalid_ticker"
  | "ticker_not_found"
  | "filing_not_found"
  | "sec_unavailable"
  | "empty_filing";

export class FilingError extends Error {
  code: FilingErrorCode;
  constructor(code: FilingErrorCode, message: string) {
    super(message);
    this.name = "FilingError";
    this.code = code;
  }
}

function userAgent(): string {
  return (
    Deno.env.get("SEC_USER_AGENT") ??
    "hudsonturansky.com Filing Summarizer (hudsonturansky@gmail.com)"
  );
}

// SEC asks for these headers. Host/Accept-Encoding help with their CDN.
function secHeaders(): HeadersInit {
  return {
    "User-Agent": userAgent(),
    "Accept-Encoding": "gzip, deflate",
    Accept: "application/json, text/html;q=0.9, */*;q=0.8",
  };
}

export function normalizeTicker(raw: unknown): string {
  const t = String(raw ?? "").trim().toUpperCase();
  // Tickers are letters with the occasional dot/dash (e.g. BRK.B, BF-B).
  if (!/^[A-Z][A-Z.-]{0,9}$/.test(t)) {
    throw new FilingError(
      "invalid_ticker",
      "Enter a valid stock ticker (e.g. AAPL, MSFT, BRK.B).",
    );
  }
  return t;
}

export function normalizeForm(raw: unknown): FilingForm {
  const f = String(raw ?? "latest").trim();
  if (f === "latest" || f === "10-K" || f === "10-Q") return f;
  // Be lenient about casing / "10K" style input.
  const upper = f.toUpperCase().replace(/\s+/g, "");
  if (upper === "10K" || upper === "10-K") return "10-K";
  if (upper === "10Q" || upper === "10-Q") return "10-Q";
  return "latest";
}

interface TickerRow {
  cik_str: number;
  ticker: string;
  title: string;
}

// Resolve a ticker to {cik (10-digit), company}. SEC's ticker file is a single
// JSON object keyed by index; we scan its values.
async function resolveTicker(ticker: string): Promise<{ cik: string; company: string }> {
  let res: Response;
  try {
    res = await fetch(TICKERS_URL, { headers: secHeaders() });
  } catch (e) {
    throw new FilingError("sec_unavailable", `Could not reach SEC: ${String(e)}`);
  }
  if (!res.ok) {
    throw new FilingError("sec_unavailable", `SEC ticker lookup failed (${res.status}).`);
  }
  const data = (await res.json()) as Record<string, TickerRow>;
  for (const row of Object.values(data)) {
    if (row && typeof row.ticker === "string" && row.ticker.toUpperCase() === ticker) {
      const cik = String(row.cik_str).padStart(10, "0");
      return { cik, company: row.title ?? ticker };
    }
  }
  throw new FilingError(
    "ticker_not_found",
    `Couldn't find a SEC filer for "${ticker}". Check the ticker, or note that some funds/ADRs aren't covered.`,
  );
}

interface RecentFilings {
  accessionNumber?: string[];
  filingDate?: string[];
  reportDate?: string[];
  form?: string[];
  primaryDocument?: string[];
}

interface SubmissionsJson {
  name?: string;
  filings?: { recent?: RecentFilings };
}

interface PickedFiling {
  form: string;
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  primaryDocument: string;
}

function pickFiling(recent: RecentFilings, want: FilingForm): PickedFiling | null {
  const forms = recent.form ?? [];
  const accns = recent.accessionNumber ?? [];
  const fdates = recent.filingDate ?? [];
  const rdates = recent.reportDate ?? [];
  const docs = recent.primaryDocument ?? [];

  // recent.* are parallel arrays sorted newest-first. Find the first index
  // whose form matches what we want.
  const matches = (form: string): boolean => {
    if (want === "latest") return form === "10-K" || form === "10-Q";
    return form === want;
  };

  // First pass: exact form match (skips amendments like "10-K/A").
  for (let i = 0; i < forms.length; i++) {
    if (matches(forms[i]) && docs[i]) {
      return {
        form: forms[i],
        accessionNumber: accns[i] ?? "",
        filingDate: fdates[i] ?? "",
        reportDate: rdates[i] ?? "",
        primaryDocument: docs[i],
      };
    }
  }

  // Fallback for a specific form: accept an amendment (e.g. "10-Q/A") if no
  // clean original is in the recent window.
  if (want !== "latest") {
    for (let i = 0; i < forms.length; i++) {
      if (forms[i].startsWith(want) && docs[i]) {
        return {
          form: forms[i],
          accessionNumber: accns[i] ?? "",
          filingDate: fdates[i] ?? "",
          reportDate: rdates[i] ?? "",
          primaryDocument: docs[i],
        };
      }
    }
  }

  return null;
}

// Main entry point: resolve ticker, find the requested filing, fetch and clean it.
export async function fetchLatestFiling(
  tickerRaw: unknown,
  formRaw: unknown,
): Promise<FetchedFiling> {
  const ticker = normalizeTicker(tickerRaw);
  const requestedForm = normalizeForm(formRaw);

  const { cik, company } = await resolveTicker(ticker);

  let subRes: Response;
  try {
    subRes = await fetch(`${SUBMISSIONS_BASE}/CIK${cik}.json`, { headers: secHeaders() });
  } catch (e) {
    throw new FilingError("sec_unavailable", `Could not reach SEC submissions: ${String(e)}`);
  }
  if (!subRes.ok) {
    throw new FilingError("sec_unavailable", `SEC submissions lookup failed (${subRes.status}).`);
  }
  const submissions = (await subRes.json()) as SubmissionsJson;
  const recent = submissions.filings?.recent;
  if (!recent) {
    throw new FilingError("filing_not_found", `No recent filings found for ${ticker}.`);
  }

  const picked = pickFiling(recent, requestedForm);
  if (!picked) {
    const label = requestedForm === "latest" ? "10-K or 10-Q" : requestedForm;
    throw new FilingError(
      "filing_not_found",
      `No recent ${label} on file for ${ticker}. Try a different form.`,
    );
  }

  const accnNoDashes = picked.accessionNumber.replace(/-/g, "");
  const cikInt = String(Number(cik)); // Archives path uses the un-padded CIK
  const docUrl = `${ARCHIVES_BASE}/${cikInt}/${accnNoDashes}/${picked.primaryDocument}`;

  let docRes: Response;
  try {
    docRes = await fetch(docUrl, { headers: secHeaders() });
  } catch (e) {
    throw new FilingError("sec_unavailable", `Could not fetch the filing document: ${String(e)}`);
  }
  if (!docRes.ok) {
    throw new FilingError("sec_unavailable", `Filing document fetch failed (${docRes.status}).`);
  }

  const rawHtml = await docRes.text();
  const cleaned = cleanFilingHtml(rawHtml);
  if (!cleaned || cleaned.length < 200) {
    throw new FilingError(
      "empty_filing",
      `The ${picked.form} for ${ticker} didn't contain readable text. Try another form.`,
    );
  }

  const truncated = cleaned.length > MAX_FILING_CHARS;
  const text = truncated ? cleaned.slice(0, MAX_FILING_CHARS) : cleaned;

  const meta: FilingMeta = {
    ticker,
    cik,
    company,
    form: picked.form,
    requestedForm,
    filingDate: picked.filingDate,
    reportDate: picked.reportDate,
    accessionNumber: picked.accessionNumber,
    primaryDocument: picked.primaryDocument,
    sourceUrl: docUrl,
    truncated,
  };

  return { meta, text };
}

// ---------------------------------------------------------------------------
// Cleaner
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "-",
  mdash: "—",
  lsquo: "'",
  rsquo: "'",
  ldquo: '"',
  rdquo: '"',
  hellip: "…",
  trade: "™",
  reg: "®",
  copy: "©",
  bull: "•",
  middot: "·",
  deg: "°",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  sect: "§",
};

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (whole, body: string) => {
    if (body[0] === "#") {
      const isHex = body[1] === "x" || body[1] === "X";
      const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(code) && code > 0 && code <= 0x10ffff) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return " ";
        }
      }
      return " ";
    }
    const named = NAMED_ENTITIES[body];
    return named !== undefined ? named : whole;
  });
}

// Strip inline-XBRL plumbing, scripts/styles, tags, and entities; preserve
// paragraph/table structure as line breaks so the LLM sees readable text.
export function cleanFilingHtml(html: string): string {
  let s = html;

  // 1. Drop XML/doctype declarations and HTML comments.
  s = s.replace(/<\?[\s\S]*?\?>/g, " ");
  s = s.replace(/<!--[\s\S]*?-->/g, " ");
  s = s.replace(/<!DOCTYPE[^>]*>/gi, " ");

  // 2. Remove whole blocks that are pure noise: scripts, styles, and the
  //    inline-XBRL header/hidden sections (contexts, units, schema refs).
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<ix:header\b[^>]*>[\s\S]*?<\/ix:header>/gi, " ");
  s = s.replace(/<ix:hidden\b[^>]*>[\s\S]*?<\/ix:hidden>/gi, " ");
  s = s.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, " ");

  // 3. Turn block-level boundaries into newlines and table cells into spaces,
  //    so prose and financial tables stay readable once tags are gone.
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(
    /<\/(p|div|section|article|tr|li|ul|ol|table|thead|tbody|tfoot|caption|blockquote|h[1-6])\s*>/gi,
    "\n",
  );
  s = s.replace(/<\/(td|th)\s*>/gi, " ");

  // 4. Strip every remaining tag (including inline-XBRL <ix:nonFraction ...>
  //    wrappers — their numeric text is kept, only the wrapper is removed).
  s = s.replace(/<[^>]+>/g, " ");

  // 5. Decode HTML entities now that no real tags remain.
  s = decodeEntities(s);

  // 6. Normalize whitespace: unify newlines, collapse intra-line runs, trim
  //    around line breaks, and cap consecutive blank lines.
  s = s.replace(/\r\n?/g, "\n");
  s = s.replace(/[^\S\n]+/g, " ");
  s = s.replace(/ *\n */g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}
