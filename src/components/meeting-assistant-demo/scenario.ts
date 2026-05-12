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
    { name: 'brightloop-msa.pdf' },
    { name: 'cohort-analysis-q1.csv' },
    { name: 'nps-q1-report.pdf' },
    { name: 'ats-dashboard.csv' },
    { name: 'stripe-export.csv' },
    { name: 'competitor-tracking' },
    { name: 'team-okrs.docx' },
  ],
  transcript: [
    { id: 't1',  speaker: 'Maya',   text: 'Okay, kicking off the Q4 review.',                                                 startAt:  0.0  },
    { id: 't2',  speaker: 'Jordan', text: 'Last quarter we grew revenue 30%, which is huge.',                                 startAt:  2.0  },
    { id: 't3',  speaker: 'Maya',   text: 'And what about churn — anyone have the latest number?',                            startAt:  6.25 },
    { id: 't4',  speaker: 'Jordan', text: "Competitors like Loom don't have anything like this.",                             startAt: 11.0  },
    { id: 't5',  speaker: 'Maya',   text: "Great — let's talk pricing tiers. How's enterprise adoption looking?",             startAt: 15.75 },
    { id: 't6',  speaker: 'Jordan', text: "And BrightLoop wants to renew at last year's rates.",                              startAt: 20.75 },
    { id: 't7',  speaker: 'Maya',   text: "Got it — we'll push back on that.",                                                startAt: 25.75 },
    { id: 't8',  speaker: 'Jordan', text: "Quick one — where are we on hiring for the AE team?",                              startAt: 28.0  },
    { id: 't9',  speaker: 'Maya',   text: "Okay. And the new self-serve tier — how's it doing?",                              startAt: 32.5  },
    { id: 't10', speaker: 'Jordan', text: 'We just crossed 200 paying users on self-serve.',                                  startAt: 35.0  },
    { id: 't11', speaker: 'Maya',   text: "Got it, almost there. What's retention looking like on self-serve?",               startAt: 39.5  },
    { id: 't12', speaker: 'Jordan', text: 'Strong. Last thing — NPS jumped to 72 this quarter.',                              startAt: 44.0  },
    { id: 't13', speaker: 'Maya',   text: "Solid. Great review everyone — let's wrap.",                                       startAt: 49.0  },
  ] satisfies TranscriptEntry[],
  annotations: [
    { id: 'a1', type: 'claim_check',       text: 'Last quarter actually grew 28%, not 30%.',                                                   citation: { source: 'Q3-report.pdf',            locator: 'p.4 · revenue table' }, fireAt:  4.5  },
    { id: 'a2', type: 'question_answered', text: 'Net revenue churn last month: 1.8% (Mar 2026).',                                             citation: { source: 'metrics-dashboard.csv',    locator: 'row 142' },              fireAt:  9.0  },
    { id: 'a3', type: 'insight',           text: 'Loom shipped AI summaries on Mar 14, 2026 — but no live citation feature.',                  citation: { source: 'loom.com/blog',            locator: 'Mar 14, 2026' },         fireAt: 13.75 },
    { id: 'a4', type: 'question_answered', text: 'Enterprise plan: 12 new logos in Q3, up from 7 in Q2.',                                      citation: { source: 'metrics-dashboard.csv',    locator: 'row 87' },               fireAt: 18.5  },
    { id: 'a5', type: 'claim_check',       text: "BrightLoop's contract includes an 8% annual escalator — last year's rate isn't an option.", citation: { source: 'brightloop-msa.pdf',       locator: '§3.2' },                 fireAt: 23.5  },
    { id: 'a6', type: 'question_answered', text: '3 of 6 AE roles filled in Q3 — 2 candidates in final round.',                                citation: { source: 'ats-dashboard.csv',        locator: 'open roles' },           fireAt: 30.5  },
    { id: 'a7', type: 'claim_check',       text: 'Self-serve tier was at 187 paying users as of Apr 30 — close to 200 but not over yet.',     citation: { source: 'stripe-export.csv',        locator: 'row 1204' },             fireAt: 37.5  },
    { id: 'a8', type: 'question_answered', text: 'Self-serve 30-day retention: 64% (industry benchmark: 35%).',                                citation: { source: 'cohort-analysis-q1.csv',   locator: 'cohort B' },             fireAt: 42.0  },
    { id: 'a9', type: 'insight',           text: 'NPS survey response rate was 12% — small sample, treat 72 as directional.',                  citation: { source: 'nps-q1-report.pdf',        locator: 'methodology' },          fireAt: 46.5  },
  ] satisfies Annotation[],
  durationSec: 55,
} as const;
