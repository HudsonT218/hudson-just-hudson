import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadStatus,
} from "@/lib/lead-os-types";
import { admin, LEAD_STATUS_COLORS } from "./theme";
import { StatusDot, SkeletonBlock, EmptyState } from "./ui";
import { LeadCard } from "./LeadCard";

const COLUMN_PREFIX = "column:";

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-3 pb-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} className="rounded-xl" style={{ height: 88 }} />
      ))}
    </div>
  );
}

function Column({
  status,
  leads,
  loading,
}: {
  status: LeadStatus;
  leads: Lead[];
  loading?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${COLUMN_PREFIX}${status}`,
    data: { status },
  });

  const tint = LEAD_STATUS_COLORS[status].soft;
  const dead = status === "dead";
  const label = LEAD_STATUS_LABEL[status];

  return (
    <div
      role="list"
      aria-label={`${label} column, ${leads.length} ${leads.length === 1 ? "lead" : "leads"}`}
      className="flex flex-col rounded-2xl shrink-0"
      style={{
        width: 300,
        backgroundColor: tint,
        border: `1px solid ${isOver ? admin.borderStrong : admin.border}`,
        opacity: dead ? 0.65 : 1,
        transition: "border-color 120ms ease",
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: admin.textDim,
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        </div>
        <span className="font-mono" style={{ fontSize: 11, color: admin.textDim }}>
          {leads.length.toString().padStart(2, "0")}
        </span>
      </div>

      <SortableContext
        id={`${COLUMN_PREFIX}${status}`}
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex flex-col gap-2 px-3 pb-3 min-h-[120px]">
          {loading ? (
            <ColumnSkeleton />
          ) : leads.length === 0 ? (
            <p
              className="text-xs px-1 py-2"
              style={{ color: admin.textDim, fontStyle: "italic" }}
            >
              No leads
            </p>
          ) : (
            leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function LeadBoard({
  leads,
  onMove,
  loading,
}: {
  leads: Lead[];
  onMove: (id: string, status: LeadStatus) => void;
  loading?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const grouped = useMemo(() => {
    const out: Record<LeadStatus, Lead[]> = {
      cold: [],
      warm: [],
      client: [],
      dead: [],
    };
    for (const l of leads) out[l.status].push(l);
    return out;
  }, [leads]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const activeLead = leads.find((l) => l.id === activeId);
    if (!activeLead) return;

    let destStatus: LeadStatus | null = null;

    const overId = String(over.id);
    if (overId.startsWith(COLUMN_PREFIX)) {
      destStatus = overId.slice(COLUMN_PREFIX.length) as LeadStatus;
    } else {
      const containerId = (over.data.current?.sortable as { containerId?: string } | undefined)
        ?.containerId;
      if (containerId && containerId.startsWith(COLUMN_PREFIX)) {
        destStatus = containerId.slice(COLUMN_PREFIX.length) as LeadStatus;
      } else {
        const overLead = leads.find((l) => l.id === overId);
        if (overLead) destStatus = overLead.status;
      }
    }

    if (destStatus && destStatus !== activeLead.status) {
      onMove(activeId, destStatus);
    }
  };

  const isEmpty = !loading && leads.length === 0;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {isEmpty && (
        <EmptyState className="mb-4">
          No leads yet. Add your first lead to get started.
        </EmptyState>
      )}
      <div
        role="region"
        aria-label="Leads board. Use Tab to focus a card, Space to pick up, arrow keys to move, Space to drop."
        className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2"
      >
        {LEAD_STATUSES.map((s) => (
          <Column key={s} status={s} leads={grouped[s]} loading={loading} />
        ))}
      </div>
    </DndContext>
  );
}

export default LeadBoard;
