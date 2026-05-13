import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ExternalLink } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  listApprovedReferencesPublic,
  listArchivedReferences,
  listPendingReviewReferences,
  listReferenceRequests,
  updateReferenceDisplayOrder,
  updateReferenceStatus,
} from "@/lib/references-db";
import type {
  PublicApprovedReference,
  Reference,
  ReferenceRequest,
  ReferenceWithRequest,
} from "@/lib/references-types";
import {
  ReferenceRequestStatusBadge,
  ReferenceStatusBadge,
} from "./_components/StatusBadge";
import { formatDate } from "./_components/format";

const sectionCard: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
};

const REFS_KEY = ["admin", "references"] as const;

const References = () => {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: REFS_KEY,
    queryFn: async () => {
      const [r, p, a, ar] = await Promise.all([
        listReferenceRequests(),
        listPendingReviewReferences(),
        listApprovedReferencesPublic(),
        listArchivedReferences(),
      ]);
      return { requests: r, pending: p, approved: a, archived: ar };
    },
  });

  const requests: ReferenceRequest[] = data?.requests ?? [];
  const pending: ReferenceWithRequest[] = data?.pending ?? [];
  const approved: PublicApprovedReference[] = data?.approved ?? [];
  const archived: Reference[] = data?.archived ?? [];
  const loading = isLoading && !data;
  const errorMsg = error instanceof Error ? error.message : null;
  const refresh = () => qc.invalidateQueries({ queryKey: REFS_KEY });

  return (
    <AdminLayout>
      <Helmet>
        <title>References — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10 space-y-12 max-w-6xl">
        <h1
          className="text-2xl font-extrabold text-white"
          style={{ letterSpacing: "-0.02em" }}
        >
          References
        </h1>

        {errorMsg && (
          <div
            className="rounded-md p-4 text-sm text-red-300"
            style={{
              backgroundColor: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {errorMsg}
          </div>
        )}

        <InviteSection onSent={refresh} />
        <InvitesTable
          requests={requests}
          loading={loading}
          onChanged={refresh}
        />
        <PendingReviewSection items={pending} loading={loading} onChanged={refresh} />
        <LiveOnSiteSection items={approved} loading={loading} onChanged={refresh} />
        <ArchiveSection items={archived} onChanged={refresh} />
      </div>
    </AdminLayout>
  );
};

// ============================================================================
// Section 1 — Invite form
// ============================================================================

const InviteSection = ({ onSent }: { onSent: () => void }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-reference-invite", {
        body: { email: trimmed, name: name.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(String(data.error));
      toast.success(`Invite sent to ${trimmed}`);
      setEmail("");
      setName("");
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2
        className="text-lg font-bold text-white mb-4"
        style={{ letterSpacing: "-0.01em" }}
      >
        Request a Reference
      </h2>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-5 flex flex-col sm:flex-row gap-3"
        style={sectionCard}
      >
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send Invite"}
        </Button>
      </form>
    </section>
  );
};

// ============================================================================
// Section 2 — Invites Sent
// ============================================================================

const InvitesTable = ({
  requests,
  loading,
  onChanged,
}: {
  requests: ReferenceRequest[];
  loading: boolean;
  onChanged: () => void;
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleResend = async (req: ReferenceRequest) => {
    setBusyId(req.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-reference-invite", {
        body: { email: req.invited_email, name: req.invited_name ?? undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(String(data.error));
      toast.success(`Invite resent to ${req.invited_email}`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (req: ReferenceRequest) => {
    setBusyId(req.id);
    try {
      const { data, error } = await supabase.functions.invoke("revoke-reference-invite", {
        body: { request_id: req.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(String(data.error));
      toast.success("Invite revoked");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2
        className="text-lg font-bold text-white mb-4"
        style={{ letterSpacing: "-0.01em" }}
      >
        Invites Sent
      </h2>
      <div className="rounded-2xl overflow-hidden" style={sectionCard}>
        {loading ? (
          <p className="text-sm text-gray-500 p-5">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-500 p-5">
            No invites yet. Send your first one above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="text-white">{req.invited_email}</TableCell>
                  <TableCell className="text-gray-400">{req.invited_name ?? "—"}</TableCell>
                  <TableCell>
                    <ReferenceRequestStatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatDate(req.created_at)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatDate(req.expires_at)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatDate(req.submitted_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "pending" ? (
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === req.id}
                          onClick={() => handleResend(req)}
                        >
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === req.id}
                          onClick={() => handleRevoke(req)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Revoke
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
};

// ============================================================================
// Section 3 — Pending Review
// ============================================================================

const PendingReviewSection = ({
  items,
  loading,
  onChanged,
}: {
  items: ReferenceWithRequest[];
  loading: boolean;
  onChanged: () => void;
}) => {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rawId, setRawId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await updateReferenceStatus(id, "approved");
      toast.success("Reference approved");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    try {
      await updateReferenceStatus(id, "rejected");
      toast.success("Reference rejected");
      setRejectId(null);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2
        className="text-lg font-bold text-white mb-4"
        style={{ letterSpacing: "-0.01em" }}
      >
        Pending Review
      </h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No pending references.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((ref) => (
            <div key={ref.id} className="rounded-2xl p-5" style={sectionCard}>
              <div className="mb-2">
                <div className="text-base font-semibold text-white">{ref.name}</div>
                <div className="text-sm text-gray-400">{ref.role_title}</div>
              </div>
              <p className="text-lg italic text-white/90 mb-3" style={{ letterSpacing: "-0.01em" }}>
                "{ref.headline}"
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
                <span>Submitted {formatDate(ref.created_at)}</span>
                {ref.linkedin_url ? (
                  <a
                    href={ref.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200"
                  disabled={busyId === ref.id}
                  onClick={() => handleApprove(ref.id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                  disabled={busyId === ref.id}
                  onClick={() => setRejectId(ref.id)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRawId(rawId === ref.id ? null : ref.id)}
                  className="text-gray-400"
                >
                  {rawId === ref.id ? "Hide Raw" : "View Raw"}
                </Button>
              </div>
              {rawId === ref.id ? (
                <pre className="mt-4 text-[11px] text-gray-400 bg-black/30 rounded p-3 overflow-x-auto">
                  {JSON.stringify(ref, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this reference?</AlertDialogTitle>
            <AlertDialogDescription>
              It'll be moved to the archive. You can un-archive it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectId && handleReject(rejectId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

// ============================================================================
// Section 4 — Live on Site (sortable)
// ============================================================================

const LiveOnSiteSection = ({
  items,
  loading,
  onChanged,
}: {
  items: PublicApprovedReference[];
  loading: boolean;
  onChanged: () => void;
}) => {
  const [order, setOrder] = useState<PublicApprovedReference[]>(items);

  useEffect(() => {
    setOrder(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((r) => r.id === active.id);
    const newIndex = order.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(order, oldIndex, newIndex);
    setOrder(reordered);
    try {
      await updateReferenceDisplayOrder(
        reordered.map((r, i) => ({ id: r.id, display_order: i })),
      );
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder");
      setOrder(items);
    }
  };

  const handleHide = async (id: string) => {
    try {
      await updateReferenceStatus(id, "hidden");
      toast.success("Reference hidden");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to hide");
    }
  };

  return (
    <section>
      <h2
        className="text-lg font-bold text-white mb-4"
        style={{ letterSpacing: "-0.01em" }}
      >
        Live on Site
      </h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : order.length === 0 ? (
        <p className="text-sm text-gray-500">No approved references yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map((ref) => (
                <SortableRow key={ref.id} reference={ref} onHide={handleHide} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
};

const SortableRow = ({
  reference,
  onHide,
}: {
  reference: PublicApprovedReference;
  onHide: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: reference.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        ...sectionCard,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="rounded-xl px-3 py-3 flex items-center gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-500 hover:text-white cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-white">{reference.name}</span>
          <span className="text-xs text-gray-500">· {reference.role_title}</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{reference.headline}</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onHide(reference.id)}
        className="text-gray-400"
      >
        Hide
      </Button>
    </div>
  );
};

// ============================================================================
// Section 5 — Archive
// ============================================================================

const ArchiveSection = ({
  items,
  onChanged,
}: {
  items: Reference[];
  onChanged: () => void;
}) => {
  const handleUnarchive = async (id: string) => {
    try {
      await updateReferenceStatus(id, "pending_review");
      toast.success("Moved back to Pending Review");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to un-archive");
    }
  };

  return (
    <section>
      <Accordion type="single" collapsible>
        <AccordionItem value="archive" className="border-white/5">
          <AccordionTrigger className="text-lg font-bold text-white hover:no-underline">
            Archive ({items.length})
          </AccordionTrigger>
          <AccordionContent>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing archived.</p>
            ) : (
              <div className="space-y-2 pt-2">
                {items.map((ref) => (
                  <div
                    key={ref.id}
                    className="rounded-xl px-3 py-3 flex items-center gap-3"
                    style={sectionCard}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{ref.name}</span>
                        <span className="text-xs text-gray-500">· {ref.role_title}</span>
                        <ReferenceStatusBadge status={ref.status} />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUnarchive(ref.id)}
                      className="text-gray-400"
                    >
                      Un-archive
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default References;
