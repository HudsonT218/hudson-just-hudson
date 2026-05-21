import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getWarmLead,
  promoteWarmLead,
  updateWarmLead,
} from "@/lib/warm-leads-db";
import {
  WARM_LEAD_STATUSES,
  WARM_LEAD_STATUS_LABEL,
  type WarmLeadStatus,
  type WarmLeadWithSource,
} from "@/lib/warm-leads-types";
import {
  WarmLeadScorePill,
  WarmLeadStatusBadge,
} from "./_components/WarmLeadStatusBadge";
import { formatDate } from "./_components/format";
import { admin } from "./_components/theme";
import {
  AdminCard,
  SectionLabel,
  ErrorBanner,
  InfoBanner,
  EmptyState,
} from "./_components/ui";

const WarmLeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<WarmLeadWithSource | null>(null);
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getWarmLead(id)
      .then((l) => {
        if (cancelled) return;
        setLead(l);
        setDraft(l?.drafted_message ?? "");
        setNotes(l?.reviewer_notes ?? "");
        setError(null);
      })
      .catch((e) =>
        !cancelled && setError(e instanceof Error ? e.message : "Failed to load"),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <EmptyState>Loading…</EmptyState>
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <EmptyState>Warm lead not found.</EmptyState>
          <div className="text-center mt-4">
            <Link
              to="/admin/warm-leads"
              className="text-xs inline-block transition-colors hover:[color:#ffffff]"
              style={{ color: admin.textDim }}
            >
              ← Back to inbox
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const saveDraft = async () => {
    setBusy("draft");
    setError(null);
    try {
      const updated = await updateWarmLead(lead.id, {
        drafted_message: draft.trim() || null,
        reviewer_notes: notes.trim() || null,
      });
      setLead({ ...lead, ...updated });
      setInfo("Draft saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft");
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (status: WarmLeadStatus) => {
    setBusy("status");
    setError(null);
    try {
      const updated = await updateWarmLead(lead.id, { status });
      setLead({ ...lead, ...updated });
      setInfo(`Marked as ${WARM_LEAD_STATUS_LABEL[status].toLowerCase()}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setBusy(null);
    }
  };

  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setInfo("Copied to clipboard.");
    } catch {
      setError("Could not access clipboard, copy manually.");
    }
  };

  const handleApproveAndPromote = async () => {
    setBusy("promote");
    setError(null);
    try {
      const { warm_lead, lead_id } = await promoteWarmLead(lead.id);
      setLead({ ...lead, ...warm_lead });
      setInfo("Saved to CRM. Redirecting…");
      setTimeout(() => navigate(`/admin/leads/${lead_id}`), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to promote");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>
          {lead.raw_title?.slice(0, 60) ?? "Warm lead"}, Admin
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl">
        <Link
          to="/admin/warm-leads"
          className="text-xs inline-block mb-6 transition-colors hover:[color:#ffffff]"
          style={{ color: admin.textDim }}
        >
          ← Warm leads
        </Link>

        {error && (
          <div className="mb-6">
            <ErrorBanner>{error}</ErrorBanner>
          </div>
        )}
        {info && (
          <div className="mb-6">
            <InfoBanner>{info}</InfoBanner>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <WarmLeadScorePill score={lead.score} />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ color: admin.textDim }}
              >
                {lead.source_label}
              </span>
              {lead.author_handle && (
                <a
                  href={lead.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] transition-colors"
                  style={{ color: admin.textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = admin.accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = admin.textMuted)}
                >
                  @{lead.author_handle}
                </a>
              )}
              <span className="text-[11px]" style={{ color: admin.textDim }}>
                {formatDate(lead.posted_at ?? lead.created_at)}
              </span>
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: admin.text, letterSpacing: "-0.02em" }}
            >
              {lead.raw_title?.trim() || "(no title)"}
            </h1>
          </div>
          <Select
            value={lead.status}
            onValueChange={(v) => setStatus(v as WarmLeadStatus)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue>
                <WarmLeadStatusBadge status={lead.status} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WARM_LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {WARM_LEAD_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick action bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            onClick={handleApproveAndPromote}
            disabled={!!busy || !!lead.promoted_lead_id}
          >
            {lead.promoted_lead_id
              ? "✓ Saved to CRM"
              : busy === "promote"
                ? "Saving…"
                : "✓ Approve & save to CRM"}
          </Button>
          <Button
            variant="ghost"
            onClick={copyDraft}
            disabled={!draft}
            style={{ color: admin.textMuted }}
          >
            📋 Copy draft
          </Button>
          <a href={lead.url} target="_blank" rel="noreferrer">
            <Button variant="ghost" style={{ color: admin.textMuted }}>
              ↗ Open source post
            </Button>
          </a>
          <Button
            variant="ghost"
            onClick={() => setStatus("sent")}
            disabled={!!busy}
            style={{ color: admin.textMuted }}
          >
            Mark sent
          </Button>
          <Button
            variant="ghost"
            onClick={() => setStatus("dismissed")}
            disabled={!!busy}
            style={{ color: admin.textDim }}
          >
            Skip
          </Button>
        </div>

        {/* Original post */}
        <Section title="Original post">
          <p
            className="text-sm whitespace-pre-wrap leading-relaxed"
            style={{ color: admin.text }}
          >
            {lead.raw_excerpt}
          </p>
          {lead.matched_keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.matched_keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: admin.surface2,
                    border: `1px solid ${admin.border}`,
                    color: admin.textMuted,
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* LLM reasoning */}
        {lead.score_reasoning && (
          <Section title={`Why this scored ${lead.score}`}>
            <p className="text-sm italic" style={{ color: admin.textMuted }}>
              {lead.score_reasoning}
            </p>
          </Section>
        )}

        {/* Drafted reply editor */}
        <Section title="Drafted outreach">
          <Label
            htmlFor="wl-draft"
            className="text-xs mb-2 block"
            style={{ color: admin.textDim }}
          >
            Edit before sending. Aim for 2–3 sentences and one specific question.
          </Label>
          <Textarea
            id="wl-draft"
            rows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="(no draft generated, write your own)"
          />
          {lead.draft_generated_at && (
            <p
              className="text-[10px] mt-2 font-mono"
              style={{ color: admin.textDim }}
            >
              ai-drafted {formatDate(lead.draft_generated_at)}
            </p>
          )}
        </Section>

        {/* Reviewer notes */}
        <Section title="Notes">
          <Textarea
            id="wl-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes for yourself (not sent)."
          />
        </Section>

        <div className="flex gap-3 mb-12">
          <Button onClick={saveDraft} disabled={busy === "draft"}>
            {busy === "draft" ? "Saving…" : "Save draft & notes"}
          </Button>
        </div>

        {/* Linked CRM record */}
        {lead.promoted_lead_id && (
          <p className="text-xs" style={{ color: admin.textDim }}>
            Linked to CRM lead{" "}
            <Link
              to={`/admin/leads/${lead.promoted_lead_id}`}
              className="font-mono hover:underline"
              style={{ color: admin.accent }}
            >
              {lead.promoted_lead_id.slice(0, 8)}
            </Link>
          </p>
        )}
      </div>
    </AdminLayout>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <SectionLabel className="mb-3">{title}</SectionLabel>
    <AdminCard>{children}</AdminCard>
  </section>
);

export default WarmLeadDetail;
