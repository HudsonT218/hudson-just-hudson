// Personalized AI Brief — shared types between the quiz form, the result
// view, and the `ai-test-generate` edge function. (The edge function path
// is kept on the older `ai-test-generate` name to avoid orphaning the
// deployed function on Lovable Cloud — only the public-facing label was
// renamed.)

export type Effort = "easy" | "medium" | "needs_building";

export const EFFORT_LABEL: Record<Effort, string> = {
  easy: "Easy, do it yourself with ChatGPT",
  medium: "Medium, needs an off-the-shelf AI tool",
  needs_building: "Needs building",
};

export const EFFORT_COLOR: Record<Effort, string> = {
  easy: "rgba(16,185,129,0.7)",          // green
  medium: "rgba(245,158,11,0.8)",        // amber
  needs_building: "rgba(96,165,250,0.9)", // blue (CTA color — these are the "build for you" ideas)
};

export interface AiIdea {
  title: string;
  description: string;
  how_it_helps: string;
  effort: Effort;
}

export interface AiTestResults {
  summary?: string;
  at_work: AiIdea[];
  in_your_life: AiIdea[];
}

// Quiz answer shape — mirrors what we send to the edge function.
export interface QuizAnswers {
  name?: string;
  role?: string;
  industry?: string;
  team_size?: string;
  time_drains?: string[];
  daily_tools?: string[];
  repetitive_part?: string;
  life_streamline?: string[];
  personal_goal?: string;
  hobbies?: string;
  ai_usage?: string;
  ai_tools_tried?: string[];
  tech_comfort?: string;
  hand_to_ai?: string;
}

export type GenerateResponseOk = { ok: true; results: AiTestResults };
export type GenerateResponseErr = {
  ok?: false;
  error:
    | "invalid_email"
    | "invalid_answers"
    | "already_used"
    | "daily_cap_reached"
    | "llm_error"
    | "llm_parse_error"
    | "llm_shape_error"
    | "store_error"
    | "server_misconfigured"
    | "method_not_allowed"
    | "internal_error";
  message?: string;
};
export type GenerateResponse = GenerateResponseOk | GenerateResponseErr;
