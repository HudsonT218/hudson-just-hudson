import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "@/lib/lead-os-types";
import { admin, LEAD_STATUS_COLORS } from "./theme";
import { formatDate } from "./format";

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

const microLabel: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: admin.textDim,
  fontWeight: 500,
};

export function LeadCard({ lead }: { lead: Lead }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { status: lead.status } });

  const downPos = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: ReactPointerEvent) => {
    downPos.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const start = downPos.current;
    downPos.current = null;
    if (!start || isDragging) return;
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    if (dx < 5 && dy < 5) {
      navigate(`/admin/leads/${lead.id}`);
    }
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: admin.surface,
    border: `1px solid ${admin.border}`,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "pointer",
  };

  const overdue = isOverdue(lead.next_action_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Lead ${lead.name}${lead.company ? `, ${lead.company}` : ""}, status ${lead.status}. Press space to pick up and drag.`}
      onPointerDownCapture={onPointerDown}
      onPointerUpCapture={onPointerUp}
      className="rounded-xl p-3 flex flex-col gap-2 select-none transition-colors hover:[border-color:rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
    >
      <div className="text-sm font-semibold leading-snug" style={{ color: admin.text }}>
        {lead.name}
        {lead.company ? (
          <span style={{ color: admin.textMuted, fontWeight: 400 }}> · {lead.company}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
        <span style={microLabel}>Last Contact</span>
        <span style={{ fontSize: 12, color: admin.textMuted }}>
          {formatDate(lead.last_contact_date)}
        </span>
      </div>

      {(lead.next_action || lead.next_action_date) && (
        <div className="flex flex-col gap-0.5">
          <span style={microLabel}>Next</span>
          <span style={{ fontSize: 12, color: admin.textMuted }}>
            {lead.next_action_date ? (
              <span style={overdue ? { color: "#f59e0b", fontWeight: 500 } : undefined}>
                {formatDate(lead.next_action_date)}
              </span>
            ) : null}
            {lead.next_action_date && lead.next_action ? " · " : ""}
            {lead.next_action ?? ""}
          </span>
        </div>
      )}
    </div>
  );
}

export default LeadCard;
