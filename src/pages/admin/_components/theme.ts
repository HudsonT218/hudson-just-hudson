import type { LeadStatus } from "@/lib/lead-os-types";

export const admin = {
  bg: "#09090b",
  surface: "rgba(255,255,255,0.02)",
  surface2: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "#ffffff",
  textMuted: "rgb(156,163,175)",
  textDim: "rgb(107,114,128)",
  accent: "#3b82f6",
  accentSoft: "rgba(59,130,246,0.15)",
} as const;

export type AdminTheme = typeof admin;

export const LEAD_STATUS_COLORS: Record<LeadStatus, { dot: string; soft: string }> = {
  cold: { dot: "rgb(156,163,175)", soft: "rgba(255,255,255,0.06)" },
  warm: { dot: "#60a5fa", soft: "rgba(59,130,246,0.15)" },
  client: { dot: "#34d399", soft: "rgba(16,185,129,0.15)" },
  dead: { dot: "rgb(252,165,165)", soft: "rgba(127,29,29,0.25)" },
};
