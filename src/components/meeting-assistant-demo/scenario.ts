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
    { id: 't1',  speaker: 'Maya',   text: 'Okay, kicking off the Q4 review. Jordan, want to start with revenue?',                       startAt:  0.0  },
    { id: 't2',  speaker: 'Jordan', text: 'Yeah — last quarter we grew revenue 30%, which is huge.',                                    startAt:  2.0  },
    { id: 't3',  speaker: 'Maya',   text: 'Wait, 28? Good thing we caught that before the board sees it.',                              startAt:  5.0  },
    { id: 't4',  speaker: 'Maya',   text: "Speaking of the board — they'll ask about churn.",                                           startAt:  7.0  },
    { id: 't5',  speaker: 'Jordan', text: "I think we're hovering around 2%? Sarah would know for sure.",                               startAt:  9.0  },
    { id: 't6',  speaker: 'Maya',   text: "Under 2 percent — we can frame that as a win.",                                              startAt: 12.0  },
    { id: 't7',  speaker: 'Jordan', text: "On competition — Loom's been quiet. They don't have anything like this.",                    startAt: 14.0  },
    { id: 't8',  speaker: 'Maya',   text: "Hm. They're moving in the same direction — we should track that.",                           startAt: 17.3  },
    { id: 't9',  speaker: 'Maya',   text: "Pricing. How's enterprise adoption?",                                                        startAt: 19.3  },
    { id: 't10', speaker: 'Jordan', text: "Pretty good — eight, nine new logos last quarter?",                                          startAt: 21.0  },
    { id: 't11', speaker: 'Maya',   text: "Twelve? Even better than you remembered. Nice.",                                             startAt: 24.0  },
    { id: 't12', speaker: 'Jordan', text: "Oh — BrightLoop wants to renew at last year's rates.",                                       startAt: 26.0  },
    { id: 't13', speaker: 'Maya',   text: "Did we lock in an escalator on that one?",                                                   startAt: 28.0  },
    { id: 't14', speaker: 'Maya',   text: "There we go. We'll push back on the renewal.",                                               startAt: 30.3  },
    { id: 't15', speaker: 'Maya',   text: "Hiring. Where are we on the AE team?",                                                       startAt: 32.0  },
    { id: 't16', speaker: 'Jordan', text: "Slow. We've filled three roles, maybe four.",                                                startAt: 33.7  },
    { id: 't17', speaker: 'Maya',   text: "Self-serve. How's adoption since launch?",                                                   startAt: 36.7  },
    { id: 't18', speaker: 'Jordan', text: "We crossed 200 paying users last week.",                                                     startAt: 38.3  },
    { id: 't19', speaker: 'Maya',   text: "And retention? People worry self-serve churns fast.",                                        startAt: 41.0  },
    { id: 't20', speaker: 'Jordan', text: "Haven't pulled the latest cohort yet.",                                                      startAt: 43.0  },
    { id: 't21', speaker: 'Jordan', text: "Oh — and NPS jumped to 72 this quarter.",                                                    startAt: 45.3  },
    { id: 't22', speaker: 'Maya',   text: "Wait, 72? That can't be right.",                                                             startAt: 47.0  },
    { id: 't23', speaker: 'Maya',   text: "Okay — small sample. Directional. Great review everyone.",                                   startAt: 49.3  },
  ] satisfies TranscriptEntry[],
  annotations: [
    { id: 'a1', type: 'claim_check',       text: 'Last quarter actually grew 28%, not 30%.',                                                   citation: { source: 'Q3-report.pdf',          locator: 'p.4 · revenue table' }, fireAt:  3.7  },
    { id: 'a2', type: 'question_answered', text: 'Net revenue churn last month: 1.8% (Mar 2026).',                                             citation: { source: 'metrics-dashboard.csv',  locator: 'row 142' },              fireAt: 10.7  },
    { id: 'a3', type: 'insight',           text: 'Loom shipped AI summaries on Mar 14, 2026 — but no live citation feature.',                  citation: { source: 'loom.com/blog',          locator: 'Mar 14, 2026' },         fireAt: 16.0  },
    { id: 'a4', type: 'question_answered', text: 'Enterprise plan: 12 new logos in Q3, up from 7 in Q2.',                                      citation: { source: 'metrics-dashboard.csv',  locator: 'row 87' },               fireAt: 22.7  },
    { id: 'a5', type: 'claim_check',       text: "BrightLoop's contract includes an 8% annual escalator — last year's rate isn't an option.", citation: { source: 'brightloop-msa.pdf',     locator: '§3.2' },                 fireAt: 29.0  },
    { id: 'a6', type: 'question_answered', text: '3 of 6 AE roles filled in Q3 — 2 candidates in final round.',                                citation: { source: 'ats-dashboard.csv',      locator: 'open roles' },           fireAt: 35.3  },
    { id: 'a7', type: 'claim_check',       text: 'Self-serve tier was at 187 paying users as of Apr 30 — close to 200 but not over yet.',     citation: { source: 'stripe-export.csv',      locator: 'row 1204' },             fireAt: 40.0  },
    { id: 'a8', type: 'question_answered', text: 'Self-serve 30-day retention: 64% (industry benchmark: 35%).',                                citation: { source: 'cohort-analysis-q1.csv', locator: 'cohort B' },             fireAt: 44.3  },
    { id: 'a9', type: 'insight',           text: 'NPS survey response rate was 12% — small sample, treat 72 as directional.',                  citation: { source: 'nps-q1-report.pdf',      locator: 'methodology' },          fireAt: 48.3  },
  ] satisfies Annotation[],
  durationSec: 54,
} as const;
