// Prompt + schema for the Filing Summarizer.
//
// The output JSON keys are a hard contract — the results page, the PDF, and the
// email all read these exact names. DO NOT rename:
//   period, company_snapshot, headline,
//   key_numbers[{ label, value, change, note }],
//   what_changed[], risks[], watch_outs[],
//   glossary[{ term, plain }]
//
// Sent to the Lovable AI Gateway with response_format: { type: "json_object" },
// exactly like ai-test-generate.

import type { FilingMeta } from "./sec-edgar.ts";

export interface KeyNumber {
  label: string; // e.g. "Revenue"
  value: string; // e.g. "$94.0B"
  change: string; // e.g. "+8% YoY" or "n/a"
  note: string; // one short plain-English clause
}

export interface GlossaryItem {
  term: string; // jargon used in this brief
  plain: string; // plain-English meaning
}

export interface FilingBrief {
  period: string;
  company_snapshot: string;
  headline: string;
  key_numbers: KeyNumber[];
  what_changed: string[];
  risks: string[];
  watch_outs: string[];
  glossary: GlossaryItem[];
}

export const FILING_SYSTEM_PROMPT = `You are a financial analyst who is exceptional at translating dense SEC filings into a clear one-page brief for a regular person — a curious individual investor or small business owner, NOT a Wall Street professional. You explain things plainly, define jargon, and never assume finance expertise.

You will be given the cleaned text of a single SEC filing (a 10-K annual report or 10-Q quarterly report) plus its metadata. Produce a faithful, plain-English brief grounded ONLY in that filing.

OUTPUT FORMAT — strict JSON, no preamble, no markdown, no code fence:
{
  "period": "the period this filing covers, in plain words, e.g. 'Fiscal Q2 2025 — the three months ending March 29, 2025'",
  "company_snapshot": "1-2 sentences: who this company is and how it makes money, for someone who may not know it.",
  "headline": "one sentence: the single most important takeaway from THIS filing.",
  "key_numbers": [
    {
      "label": "what the number is, e.g. 'Revenue', 'Net income', 'Operating cash flow', 'Diluted EPS'",
      "value": "the figure as reported, formatted readably, e.g. '$94.0B', '$1.42', '38.2%'",
      "change": "change vs. the comparable prior period if the filing states or implies it, e.g. '+8% YoY', '-3% vs. Q1', or 'n/a' if not available",
      "note": "one short clause of plain-English context, e.g. 'driven by higher services revenue'"
    }
  ],
  "what_changed": [
    "3-6 bullet points, each one sentence, on what actually changed this period — results, segments, guidance, big events, accounting changes. Concrete and specific to this filing."
  ],
  "risks": [
    "3-6 bullet points, each one sentence, summarizing the most material risks the filing discusses, in plain language. Prefer risks the company emphasizes or that changed."
  ],
  "watch_outs": [
    "2-4 bullet points: things a non-expert reader should keep an eye on or be careful about when interpreting this filing (e.g. one-time items, non-GAAP adjustments, heavy customer concentration, going-concern language). Be honest and useful."
  ],
  "glossary": [
    { "term": "any finance term you used that a beginner might not know, e.g. 'EPS', 'YoY', 'operating margin', 'GAAP'", "plain": "a one-sentence plain-English definition" }
  ]
}

RULES:
- Use ONLY facts present in the provided filing text. Never invent numbers. If a figure isn't in the text, either omit that key number or set its value/change to "n/a". Do NOT guess.
- Provide 4-7 entries in key_numbers, prioritizing the figures that matter most for this company and period (revenue, profitability, cash flow, EPS, segment highlights).
- Keep every string tight and readable. No marketing language. No hype.
- Plain English throughout. Whenever you use a term a beginner might not know, add it to the glossary (4-8 glossary items is typical).
- This is an educational summary, NOT investment advice. Do not tell the reader to buy, sell, or hold, and do not predict the stock price.
- If the filing text appears truncated, summarize what is present and lean on the earlier sections (which usually contain the financial highlights and MD&A).
- Return ONLY the JSON object. No explanation, no markdown fence.`;

// Build the user message: metadata header + the cleaned filing text.
export function buildFilingUserMessage(meta: FilingMeta, filingText: string): string {
  const header = [
    `COMPANY: ${meta.company} (${meta.ticker})`,
    `FORM: ${meta.form}`,
    meta.filingDate ? `FILED: ${meta.filingDate}` : "",
    meta.reportDate ? `PERIOD END (reportDate): ${meta.reportDate}` : "",
    meta.truncated
      ? "NOTE: The filing text below was truncated to fit the context window. Summarize what is present; the financial highlights and MD&A are usually near the start."
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `${header}\n\n--- FILING TEXT START ---\n${filingText}\n--- FILING TEXT END ---`;
}

// Defensive shape check used by the edge function after JSON.parse. Keeps the
// gate honest — we only store/charge a use for a brief that has real content.
export function isUsableBrief(b: unknown): b is FilingBrief {
  if (!b || typeof b !== "object") return false;
  const obj = b as Record<string, unknown>;
  const hasHeadline = typeof obj.headline === "string" && obj.headline.trim().length > 0;
  const hasNumbers = Array.isArray(obj.key_numbers) && obj.key_numbers.length > 0;
  const hasChanges = Array.isArray(obj.what_changed) && obj.what_changed.length > 0;
  return hasHeadline && (hasNumbers || hasChanges);
}

// Normalize a parsed brief so downstream renderers (page, PDF, email) can trust
// the shape even if the model omits an optional array or returns odd types.
export function normalizeBrief(raw: unknown): FilingBrief {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => str(x)).filter((x) => x.length > 0) : [];

  const keyNumbers: KeyNumber[] = Array.isArray(obj.key_numbers)
    ? (obj.key_numbers as unknown[])
        .map((n) => {
          const o = (n && typeof n === "object" ? n : {}) as Record<string, unknown>;
          return {
            label: str(o.label),
            value: str(o.value),
            change: str(o.change),
            note: str(o.note),
          };
        })
        .filter((n) => n.label || n.value)
    : [];

  const glossary: GlossaryItem[] = Array.isArray(obj.glossary)
    ? (obj.glossary as unknown[])
        .map((g) => {
          const o = (g && typeof g === "object" ? g : {}) as Record<string, unknown>;
          return { term: str(o.term), plain: str(o.plain) };
        })
        .filter((g) => g.term && g.plain)
    : [];

  return {
    period: str(obj.period),
    company_snapshot: str(obj.company_snapshot),
    headline: str(obj.headline),
    key_numbers: keyNumbers,
    what_changed: strArr(obj.what_changed),
    risks: strArr(obj.risks),
    watch_outs: strArr(obj.watch_outs),
    glossary,
  };
}
