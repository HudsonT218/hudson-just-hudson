import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Copy, ExternalLink } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getSiteSettings,
  updateSiteSettings,
  type SiteSettings,
  type SiteSettingsPatch,
} from "@/lib/site-settings-db";
import { AdminPageHeader, ErrorBanner } from "./_components/ui";
import { admin } from "./_components/theme";

const SITE_SETTINGS_KEY = ["admin", "site-settings"] as const;

interface Draft {
  total: number;
  remaining: number;
  campaignOpen: boolean;
}

function toDraft(s: SiteSettings): Draft {
  return {
    total: s.free_projects_total,
    remaining: s.free_projects_remaining,
    campaignOpen: s.campaign_open,
  };
}

function diffPatch(draft: Draft, saved: SiteSettings): SiteSettingsPatch {
  const patch: SiteSettingsPatch = {};
  if (draft.total !== saved.free_projects_total) patch.free_projects_total = draft.total;
  if (draft.remaining !== saved.free_projects_remaining)
    patch.free_projects_remaining = draft.remaining;
  if (draft.campaignOpen !== saved.campaign_open) patch.campaign_open = draft.campaignOpen;
  return patch;
}

const Settings = () => {
  const qc = useQueryClient();
  const { data: saved, isLoading, error } = useQuery({
    queryKey: SITE_SETTINGS_KEY,
    queryFn: getSiteSettings,
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://hudsonturansky.com/free-build";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  useEffect(() => {
    if (saved) setDraft(toDraft(saved));
  }, [saved]);

  const mutation = useMutation({
    mutationFn: (patch: SiteSettingsPatch) => updateSiteSettings(patch),
    onSuccess: (next) => {
      qc.setQueryData(SITE_SETTINGS_KEY, next);
      setDraft(toDraft(next));
      toast.success("Saved");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Could not save settings");
    },
  });

  const dirty = saved && draft ? Object.keys(diffPatch(draft, saved)).length > 0 : false;
  const fetchError = error instanceof Error ? error.message : null;

  const handleSave = () => {
    if (!saved || !draft) return;
    const patch = diffPatch(draft, saved);
    if (Object.keys(patch).length === 0) return;
    mutation.mutate(patch);
  };

  const previewLine =
    draft && (draft.campaignOpen && draft.remaining > 0
      ? `The landing page will show: ${draft.remaining} of ${draft.total} free spots left.`
      : `The landing page will show: All ${draft.total} spots are currently full — waitlist mode.`);

  return (
    <AdminLayout>
      <Helmet>
        <title>Settings, Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <AdminPageHeader title="Settings" />

        {fetchError && (
          <div className="mt-6">
            <ErrorBanner>{fetchError}</ErrorBanner>
          </div>
        )}

        <div className="mt-8 max-w-xl">
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: admin.surface,
              border: `1px solid ${admin.border}`,
            }}
          >
            <h2
              className="text-base font-medium"
              style={{ color: admin.text, letterSpacing: "-0.01em" }}
            >
              Free-projects landing page
            </h2>
            <p className="mt-1 text-sm" style={{ color: admin.textMuted }}>
              Controls the counter and waitlist state on{" "}
              <code style={{ color: admin.textMuted }}>/free-build</code>. Update by
              hand as you take projects on.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="total" style={{ color: admin.textMuted, fontSize: 12 }}>
                  Free projects total
                </Label>
                <Input
                  id="total"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft?.total ?? ""}
                  disabled={isLoading || !draft}
                  onChange={(e) => {
                    const n = Math.max(0, Math.floor(Number(e.target.value) || 0));
                    setDraft((d) => (d ? { ...d, total: n } : d));
                  }}
                  style={{
                    backgroundColor: admin.surface2,
                    border: `1px solid ${admin.border}`,
                    color: admin.text,
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="remaining"
                  style={{ color: admin.textMuted, fontSize: 12 }}
                >
                  Free projects remaining
                </Label>
                <Input
                  id="remaining"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft?.remaining ?? ""}
                  disabled={isLoading || !draft}
                  onChange={(e) => {
                    const n = Math.max(0, Math.floor(Number(e.target.value) || 0));
                    setDraft((d) => (d ? { ...d, remaining: n } : d));
                  }}
                  style={{
                    backgroundColor: admin.surface2,
                    border: `1px solid ${admin.border}`,
                    color: admin.text,
                  }}
                />
              </div>
            </div>

            <div
              className="mt-6 flex items-center justify-between gap-4 py-3 px-4 rounded-xl"
              style={{
                backgroundColor: admin.surface2,
                border: `1px solid ${admin.border}`,
              }}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: admin.text }}>
                  Campaign open
                </div>
                <div className="text-xs" style={{ color: admin.textMuted }}>
                  Turn off to show "waitlist" on the landing page. The form still works.
                </div>
              </div>
              <Switch
                checked={draft?.campaignOpen ?? false}
                disabled={isLoading || !draft}
                onCheckedChange={(checked) =>
                  setDraft((d) => (d ? { ...d, campaignOpen: checked } : d))
                }
                aria-label="Campaign open"
              />
            </div>

            {previewLine && (
              <p
                className="mt-6 text-sm"
                style={{ color: admin.textMuted, fontStyle: "italic" }}
              >
                {previewLine}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleSave} disabled={!dirty || mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save"}
              </Button>
              {!dirty && !mutation.isPending && (
                <span className="text-xs" style={{ color: admin.textDim }}>
                  No changes to save.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
