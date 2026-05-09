import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listLeads, createLead, updateLead } from "@/lib/lead-os-db";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadStatus,
} from "@/lib/lead-os-types";
import { LeadStatusBadge } from "./_components/StatusBadge";
import { formatDate } from "./_components/format";

type Filter = "all" | LeadStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  ...LEAD_STATUSES.map((s) => ({ value: s as Filter, label: LEAD_STATUS_LABEL[s] })),
];

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = async () => {
    try {
      const result = await listLeads();
      setLeads(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listLeads()
      .then((result) => {
        if (cancelled) return;
        setLeads(result);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const l of leads) acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, [leads]);

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [filter, leads],
  );

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await updateLead(id, { status });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
      refresh();
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Leads — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl font-extrabold text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Leads
          </h1>
          <Button onClick={() => setDrawerOpen(true)}>+ Add Lead</Button>
        </div>

        <div
          className="inline-flex rounded-md p-1 mb-6"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            const count = f.value === "all" ? leads.length : counts[f.value] ?? 0;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="px-3 py-1.5 rounded text-sm transition-colors"
                style={{
                  backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
                  color: active ? "#fff" : "rgb(156,163,175)",
                }}
              >
                {f.label}
                <span className="ml-2 text-gray-500 font-mono text-[11px]">{count}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div
            className="mb-6 rounded-md p-4 text-sm text-red-300"
            style={{
              backgroundColor: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500">
            {filter === "all"
              ? "No leads yet. Click + Add Lead to create one."
              : `No leads in '${LEAD_STATUS_LABEL[filter]}' yet.`}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {visible.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      <AddLeadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreated={() => {
          setDrawerOpen(false);
          refresh();
        }}
      />
    </AdminLayout>
  );
};

const LeadCard = ({
  lead,
  onStatusChange,
}: {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
}) => {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <Link
          to={`/admin/leads/${lead.id}`}
          className="text-base font-semibold text-white hover:text-blue-400 transition-colors"
          style={{ letterSpacing: "-0.01em" }}
        >
          {lead.name}
          {lead.company ? (
            <span className="text-gray-500 font-normal ml-2">· {lead.company}</span>
          ) : null}
        </Link>
        <Select value={lead.status} onValueChange={(v) => onStatusChange(lead.id, v as LeadStatus)}>
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <SelectValue>
              <LeadStatusBadge status={lead.status} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {lead.how_i_know_them ? (
        <p className="text-xs text-gray-500 mb-2">
          <span className="text-gray-600">How I know them: </span>
          {lead.how_i_know_them}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span>
          <span className="text-gray-600">Last contact:</span> {formatDate(lead.last_contact_date)}
        </span>
        {lead.next_action_date ? (
          <span>
            <span className="text-gray-600">Next:</span> {formatDate(lead.next_action_date)}
            {lead.next_action ? ` · ${lead.next_action}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const AddLeadDrawer = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [howIKnowThem, setHowIKnowThem] = useState("");
  const [whatTheyMightNeed, setWhatTheyMightNeed] = useState("");
  const [status, setStatus] = useState<LeadStatus>("cold");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setHowIKnowThem("");
    setWhatTheyMightNeed("");
    setStatus("cold");
    setNotes("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createLead({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        company: company.trim() || null,
        how_i_know_them: howIKnowThem.trim() || null,
        what_they_might_need: whatTheyMightNeed.trim() || null,
        status,
        last_contact_date: null,
        next_action: null,
        next_action_date: null,
        notes: notes.trim() || null,
      });
      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Lead</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="lead-name">Name *</Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lead-company">Company</Label>
            <Input
              id="lead-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="lead-how">How I know them</Label>
            <Input
              id="lead-how"
              placeholder="college friend / referred by X / LinkedIn"
              value={howIKnowThem}
              onChange={(e) => setHowIKnowThem(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="lead-need">What they might need</Label>
            <Textarea
              id="lead-need"
              rows={3}
              value={whatTheyMightNeed}
              onChange={(e) => setWhatTheyMightNeed(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="lead-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
              <SelectTrigger id="lead-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LEAD_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lead-notes">Initial notes</Label>
            <Textarea
              id="lead-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Lead"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default Leads;
