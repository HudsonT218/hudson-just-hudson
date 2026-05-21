import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { AdminPageHeader, SegmentedToggle, ErrorBanner } from "./_components/ui";
import { admin } from "./_components/theme";
import { LeadBoard } from "./_components/LeadBoard";
import { LeadListView } from "./_components/LeadListView";
import { LeadDetailModal } from "./_components/LeadDetailModal";

type ViewMode = "board" | "list";
const VIEW_KEY = "admin.leads.view";
const LEADS_KEY = ["admin", "leads"] as const;

const Leads = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { id: detailId } = useParams<{ id: string }>();
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: LEADS_KEY,
    queryFn: () => listLeads(),
  });
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "board";
    const stored = window.localStorage.getItem(VIEW_KEY);
    return stored === "list" ? "list" : "board";
  });
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  const loading = isLoading && leads.length === 0;
  const errMsg = mutationError ?? (error instanceof Error ? error.message : null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) => {
      const name = l.name?.toLowerCase() ?? "";
      const company = l.company?.toLowerCase() ?? "";
      return name.includes(q) || company.includes(q);
    });
  }, [search, leads]);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    qc.setQueryData<Lead[]>(LEADS_KEY, (prev) =>
      prev ? prev.map((l) => (l.id === id ? { ...l, status } : l)) : prev,
    );
    try {
      await updateLead(id, { status });
      qc.invalidateQueries({ queryKey: LEADS_KEY });
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed to update");
      qc.invalidateQueries({ queryKey: LEADS_KEY });
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Leads, Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <AdminPageHeader
          title="Leads"
          actions={
            <>
              <SegmentedToggle<ViewMode>
                options={[
                  { value: "board", label: "Board" },
                  { value: "list", label: "List" },
                ]}
                value={view}
                onChange={setView}
                ariaLabel="Leads view mode"
              />
              <Button onClick={() => setDrawerOpen(true)}>+ Add Lead</Button>
            </>
          }
        />

        <div className="mt-6 mb-6 w-full max-w-sm">
          <Input
            placeholder="Search by name or company…"
            aria-label="Search leads by name or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              backgroundColor: admin.surface,
              border: `1px solid ${admin.border}`,
              color: admin.text,
            }}
          />
        </div>

        {errMsg && <div className="mb-6"><ErrorBanner>{errMsg}</ErrorBanner></div>}

        {view === "board" ? (
          <LeadBoard leads={filtered} onMove={handleStatusChange} loading={loading} />
        ) : (
          <LeadListView leads={filtered} loading={loading} />
        )}
      </div>

      <AddLeadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreated={() => {
          setDrawerOpen(false);
          qc.invalidateQueries({ queryKey: LEADS_KEY });
        }}
      />

      {detailId && (
        <LeadDetailModal
          leadId={detailId}
          open
          onClose={() => {
            qc.invalidateQueries({ queryKey: LEADS_KEY });
            navigate("/admin/leads");
          }}
        />
      )}
    </AdminLayout>
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
