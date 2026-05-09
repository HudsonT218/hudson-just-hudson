import {
  LEAD_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  type LeadStatus,
  type ProjectStatus,
  type ProjectType,
} from "@/lib/lead-os-types";

const LEAD_COLORS: Record<LeadStatus, { bg: string; fg: string }> = {
  cold: { bg: "rgba(255,255,255,0.06)", fg: "rgb(156,163,175)" },
  warm: { bg: "rgba(59,130,246,0.15)", fg: "#60a5fa" },
  client: { bg: "rgba(16,185,129,0.15)", fg: "#34d399" },
  dead: { bg: "rgba(127,29,29,0.25)", fg: "rgb(252,165,165)" },
};

const PROJECT_COLORS: Record<ProjectStatus, { bg: string; fg: string }> = {
  discovery: { bg: "rgba(255,255,255,0.06)", fg: "rgb(156,163,175)" },
  proposal_sent: { bg: "rgba(168,85,247,0.15)", fg: "#c084fc" },
  active: { bg: "rgba(59,130,246,0.15)", fg: "#60a5fa" },
  delivered: { bg: "rgba(16,185,129,0.15)", fg: "#34d399" },
  invoiced: { bg: "rgba(245,158,11,0.15)", fg: "#fbbf24" },
  paid: { bg: "rgba(16,185,129,0.2)", fg: "#34d399" },
  cancelled: { bg: "rgba(127,29,29,0.25)", fg: "rgb(252,165,165)" },
};

const PROJECT_TYPE_COLORS: Record<ProjectType, { bg: string; fg: string }> = {
  web: { bg: "rgba(59,130,246,0.12)", fg: "#60a5fa" },
  ai: { bg: "rgba(16,185,129,0.12)", fg: "#34d399" },
  software: { bg: "rgba(245,158,11,0.12)", fg: "#fbbf24" },
  automation: { bg: "rgba(168,85,247,0.12)", fg: "#c084fc" },
};

const Pill = ({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) => (
  <span
    className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
    style={{ backgroundColor: bg, color: fg }}
  >
    {children}
  </span>
);

export const LeadStatusBadge = ({ status }: { status: LeadStatus }) => {
  const c = LEAD_COLORS[status];
  return (
    <Pill bg={c.bg} fg={c.fg}>
      {LEAD_STATUS_LABEL[status].toUpperCase()}
    </Pill>
  );
};

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => {
  const c = PROJECT_COLORS[status];
  return (
    <Pill bg={c.bg} fg={c.fg}>
      {PROJECT_STATUS_LABEL[status].toUpperCase()}
    </Pill>
  );
};

export const ProjectTypeBadge = ({ type }: { type: ProjectType }) => {
  const c = PROJECT_TYPE_COLORS[type];
  return (
    <Pill bg={c.bg} fg={c.fg}>
      {PROJECT_TYPE_LABEL[type].toUpperCase()}
    </Pill>
  );
};
