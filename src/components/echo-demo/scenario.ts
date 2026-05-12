export type AnnotationType = 'claim_check' | 'question_answered' | 'insight';

export type TranscriptEntry = {
  id: string;
  speaker: 'Maya' | 'Jordan';
  text: string;
  startAt: number;
};

export type Annotation = {
  id: string;
  type: AnnotationType;
  text: string;
  citation: { source: string; locator: string };
  fireAt: number;
};

export const scenario = {
  meta: { title: 'Q4 Review' },
  context: [
    { name: 'Q3-report.pdf' },
    { name: 'metrics-dashboard.csv' },
    { name: 'competitor-tracking' },
    { name: 'team-okrs.docx' },
  ],
  transcript: [
    { id: 't1', speaker: 'Maya',   text: 'Okay, kicking off the Q4 review.',                                                  startAt: 0.0  },
    { id: 't2', speaker: 'Jordan', text: 'Last quarter we grew revenue 30%, which is huge.',                                  startAt: 4.0  },
    { id: 't3', speaker: 'Maya',   text: 'And what about churn — anyone have the latest number?',                             startAt: 12.5 },
    { id: 't4', speaker: 'Jordan', text: "Competitors like Loom don't have anything like this.",                              startAt: 22.0 },
    { id: 't5', speaker: 'Maya',   text: "Great — let's talk pricing tiers. How's enterprise adoption looking?",              startAt: 31.5 },
    { id: 't6', speaker: 'Jordan', text: "And BrightLoop wants to renew at last year's rates.",                               startAt: 41.5 },
    { id: 't7', speaker: 'Maya',   text: "Got it — we'll push back on that. Great review.",                                   startAt: 51.5 },
  ] satisfies TranscriptEntry[],
  annotations: [
    {
      id: 'a1',
      type: 'claim_check',
      text: 'Last quarter actually grew 28%, not 30%.',
      citation: { source: 'Q3-report.pdf', locator: 'p.4 · revenue table' },
      fireAt: 9.0,
    },
    {
      id: 'a2',
      type: 'question_answered',
      text: 'Net revenue churn last month: 1.8% (Mar 2026).',
      citation: { source: 'metrics-dashboard.csv', locator: 'row 142' },
      fireAt: 18.0,
    },
    {
      id: 'a3',
      type: 'insight',
      text: 'Loom shipped AI summaries on Mar 14, 2026 — but no live citation feature.',
      citation: { source: 'loom.com/blog', locator: 'Mar 14, 2026' },
      fireAt: 27.5,
    },
    {
      id: 'a4',
      type: 'question_answered',
      text: 'Enterprise plan: 12 new logos in Q3, up from 7 in Q2.',
      citation: { source: 'metrics-dashboard.csv', locator: 'row 87' },
      fireAt: 37.0,
    },
    {
      id: 'a5',
      type: 'claim_check',
      text: "BrightLoop's contract includes an 8% annual escalator — last year's rate isn't an option.",
      citation: { source: 'deals/brightloop-msa.pdf', locator: '§3.2' },
      fireAt: 47.0,
    },
  ] satisfies Annotation[],
  durationSec: 60,
} as const;
