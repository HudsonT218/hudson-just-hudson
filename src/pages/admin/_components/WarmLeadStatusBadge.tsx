import {
  WARM_LEAD_STATUS_LABEL,
  type WarmLeadStatus,
} from "@/lib/warm-leads-types";

const COLORS: Record<WarmLeadStatus, { bg: string; fg: string }> = {
  new: { bg: "rgba(59,130,246,0.18)", fg: "#60a5fa" },
  approved: { bg: "rgba(168,85,247,0.18)", fg: "#c084fc" },
  sent: { bg: "rgba(245,158,11,0.18)", fg: "#fbbf24" },
  converted: { bg: "rgba(16,185,129,0.20)", fg: "#34d399" },
  rejected: { bg: "rgba(127,29,29,0.25)", fg: "rgb(252,165,165)" },
  dismissed: { bg: "rgba(255,255,255,0.06)", fg: "rgb(156,163,175)" },
};

export const WarmLeadStatusBadge = ({ status }: { status: WarmLeadStatus }) => {
  const c = COLORS[status];
  return (
    <span
      className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {WARM_LEAD_STATUS_LABEL[status].toUpperCase()}
    </span>
  );
};

export const WarmLeadScorePill = ({ score }: { score: number }) => {
  // Heat-mapped: cold blue → warm orange → hot green.
  let bg = "rgba(255,255,255,0.06)";
  let fg = "rgb(156,163,175)";
  if (score >= 80) {
    bg = "rgba(16,185,129,0.20)";
    fg = "#34d399";
  } else if (score >= 60) {
    bg = "rgba(245,158,11,0.18)";
    fg = "#fbbf24";
  } else if (score >= 30) {
    bg = "rgba(59,130,246,0.15)";
    fg = "#60a5fa";
  }
  return (
    <span
      className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: bg, color: fg }}
      title="Classifier score 0–100"
    >
      {score}
    </span>
  );
};
