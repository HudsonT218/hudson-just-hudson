import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MODEL_DEFINITIONS,
  THEME_DEFINITIONS,
  SECTION_TYPE_DEFINITIONS,
} from "@/lib/configurator-constants";
import type { DraftState } from "@/hooks/use-draft";
import { isStripeConfigured } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";

interface StepReviewCheckoutProps {
  draft: DraftState;
  onJumpToStep: (step: number) => void;
  onCheckout: () => Promise<void>;
}

/**
 * Step 5 — full-form layout. Order summary on the left, narrow preview on the
 * right (provided by WizardShell). Price + checkout in a sticky bottom bar
 * at the form's foot.
 */
export function StepReviewCheckout({ draft, onJumpToStep, onCheckout }: StepReviewCheckoutProps) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const model = MODEL_DEFINITIONS.find((m) => m.id === draft.model);
  const theme = THEME_DEFINITIONS.find((t) => t.id === draft.theme);
  const price = model?.basePrice ?? 0;

  async function handleCheckout() {
    setCheckingOut(true);
    setError(null);
    try {
      await onCheckout();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Review and check out</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confirm everything below, then pay. We&apos;ll start building right after payment clears.
        </p>
      </div>

      <div className="space-y-3">
        <SummaryRow label="Model" onEdit={() => onJumpToStep(1)}>
          <div>
            <div className="font-medium text-foreground">{model?.name ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{model?.description}</p>
          </div>
        </SummaryRow>

        <SummaryRow label="Theme" onEdit={() => onJumpToStep(2)}>
          <div className="flex items-center gap-3">
            {theme && (
              <div className="flex gap-1">
                {[theme.swatches.primary, theme.swatches.secondary, theme.swatches.accent].map((c) => (
                  <span
                    key={c}
                    className="h-4 w-4 rounded-full border border-white/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
            )}
            <span className="text-sm font-medium text-foreground">{theme?.name ?? "—"}</span>
          </div>
        </SummaryRow>

        <SummaryRow
          label={`Sections (${draft.sections.length})`}
          onEdit={() => onJumpToStep(3)}
        >
          <ol className="space-y-1 text-sm">
            {draft.sections.map((s, i) => {
              const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === s.type);
              return (
                <li key={s.type} className="flex items-center gap-2">
                  <span className="text-muted-foreground/70 w-5 text-xs">{i + 1}.</span>
                  <span className="font-medium text-foreground">{def?.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {s.variant.replace(/^[a-z-]+-/, "")}
                  </Badge>
                </li>
              );
            })}
          </ol>
        </SummaryRow>

        <SummaryRow label="Content" onEdit={() => onJumpToStep(4)}>
          {draft.scrapedUrl ? (
            <p className="text-sm text-muted-foreground">
              We&apos;ll extract content from{" "}
              <span className="text-foreground font-medium">{draft.scrapedUrl}</span> during build.
            </p>
          ) : Object.keys(draft.content).length > 0 ? (
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Content provided for {Object.keys(draft.content).length} section
              {Object.keys(draft.content).length === 1 ? "" : "s"}.
            </p>
          ) : (
            <p className="text-sm text-yellow-400 inline-flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> No content yet — defaults will be used. You can
              always submit feedback after the first build.
            </p>
          )}
        </SummaryRow>
      </div>

      {/* Price + checkout */}
      <div className="mt-6 rounded-lg border border-blue-400/20 bg-blue-400/[0.04] p-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(price)}
            </div>
            <div className="text-xs text-muted-foreground">flat — includes 5 revisions</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mb-4">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Secure checkout via Stripe. Cancel anytime before your site is built.
        </p>

        {!isStripeConfigured && (
          <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-foreground mb-3">
            <strong>Stripe is not configured yet.</strong> Checkout will create a draft order
            directly so the rest of the flow can be exercised.
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive mb-3">
            {error}
          </div>
        )}

        <Button size="lg" className="w-full" onClick={handleCheckout} disabled={checkingOut}>
          {checkingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Proceed to payment — {formatCurrency(price)}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground/80 font-semibold">
          {label}
        </h3>
        <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 -mt-1">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
      </div>
      {children}
    </div>
  );
}
