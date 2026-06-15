// Filing Summarizer — shared types between the page and the `summarize-filing`
// edge function response. The brief JSON keys here MUST match what the edge
// function (supabase/functions/_shared/filing-brief-prompt.ts) produces — the
// page, the PDF, and the email all read these exact names.

export type FilingForm = "latest" | "10-K" | "10-Q";

export const FORM_OPTIONS: { value: FilingForm; label: string; hint: string }[] = [
  { value: "latest", label: "Latest report", hint: "Most recent 10-K or 10-Q" },
  { value: "10-Q", label: "10-Q", hint: "Quarterly report" },
  { value: "10-K", label: "10-K", hint: "Annual report" },
];

export interface KeyNumber {
  label: string;
  value: string;
  change: string;
  note: string;
}

export interface GlossaryItem {
  term: string;
  plain: string;
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

// Metadata about the filing that was summarized (subset returned to the client).
export interface FilingResultMeta {
  ticker: string;
  cik: string;
  company: string;
  form: string;
  requestedForm: FilingForm;
  filingDate: string;
  reportDate: string;
  sourceUrl: string;
  truncated: boolean;
}

export type SummarizeResponseOk = {
  ok: true;
  results: FilingBrief;
  summaryId: string;
  meta: FilingResultMeta;
  // null = unlimited (owner). Otherwise free runs left after this one.
  uses_remaining: number | null;
};

export type SummarizeResponseErr = {
  ok?: false;
  error:
    | "invalid_email"
    | "invalid_ticker"
    | "ticker_not_found"
    | "filing_not_found"
    | "empty_filing"
    | "sec_unavailable"
    | "limit_reached"
    | "daily_cap_reached"
    | "rate_limited"
    | "credits_exhausted"
    | "llm_error"
    | "llm_parse_error"
    | "llm_shape_error"
    | "store_error"
    | "server_misconfigured"
    | "method_not_allowed"
    | "internal_error";
  message?: string;
  uses_remaining?: number;
};

export type SummarizeResponse = SummarizeResponseOk | SummarizeResponseErr;

export type EmailReportResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
};
