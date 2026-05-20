import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadStatus,
} from "@/lib/lead-os-types";
import { LeadStatusBadge } from "./StatusBadge";
import { formatDate } from "./format";
import { admin } from "./theme";
import { EmptyState } from "./ui";

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

const headStyle: React.CSSProperties = {
  color: admin.textDim,
  letterSpacing: "0.08em",
};

export function LeadListView({ leads }: { leads: Lead[] }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return leads;
    return leads.filter((l) => l.status === statusFilter);
  }, [leads, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 12, color: admin.textMuted }}>Status</span>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}
        >
          <SelectTrigger
            className="h-8 w-40 text-xs"
            style={{
              backgroundColor: admin.surface,
              border: `1px solid ${admin.border}`,
              color: admin.text,
            }}
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent
            style={{
              backgroundColor: admin.bg,
              border: `1px solid ${admin.border}`,
            }}
          >
            <SelectItem value="all" className="text-xs">
              All statuses
            </SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {LEAD_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>No leads match the current filters.</EmptyState>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: admin.surface,
            border: `1px solid ${admin.border}`,
          }}
        >
          <Table>
            <TableHeader>
              <TableRow
                className="border-0 hover:bg-transparent"
                style={{ borderBottom: `1px solid ${admin.border}` }}
              >
                <TableHead
                  className="text-[10px] font-medium uppercase"
                  style={headStyle}
                >
                  Name
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium uppercase"
                  style={headStyle}
                >
                  Company
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium uppercase"
                  style={headStyle}
                >
                  Status
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium uppercase"
                  style={headStyle}
                >
                  Last contact
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium uppercase"
                  style={headStyle}
                >
                  Next action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => {
                const overdue = isOverdue(lead.next_action_date);
                return (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer border-0 transition-colors"
                    style={{ borderBottom: `1px solid ${admin.border}` }}
                    onClick={() => navigate(`/admin/leads/${lead.id}`)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        admin.surface2;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    <TableCell
                      className="text-sm font-medium"
                      style={{ color: admin.text }}
                    >
                      {lead.name}
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: admin.textMuted }}>
                      {lead.company ?? "—"}
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: admin.textMuted }}>
                      {formatDate(lead.last_contact_date)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.next_action_date ? (
                        <span
                          style={
                            overdue
                              ? { color: "#f59e0b", fontWeight: 500 }
                              : { color: admin.textMuted }
                          }
                        >
                          {formatDate(lead.next_action_date)}
                        </span>
                      ) : (
                        <span style={{ color: admin.textDim }}>—</span>
                      )}
                      {lead.next_action ? (
                        <span style={{ color: admin.textDim }}>
                          {" "}
                          · {lead.next_action}
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default LeadListView;
