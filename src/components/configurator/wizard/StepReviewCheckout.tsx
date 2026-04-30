import { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/configurator/ui/loading-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODEL_DEFINITIONS, THEME_DEFINITIONS, SECTION_TYPE_DEFINITIONS } from '@/lib/configurator-constants';
import type { DraftState } from '@/hooks/use-draft';
import { isStripeConfigured } from '@/lib/stripe';
import { formatCurrency } from '@/lib/utils';

interface StepReviewCheckoutProps {
  draft: DraftState;
  onJumpToStep: (step: number) => void;
  onCheckout: () => Promise<void>;
}

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
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Review and check out</h2>
        <p className="text-muted-foreground mt-1">
          Confirm your build, then pay. We&apos;ll start work right after payment clears.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Model</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => onJumpToStep(1)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-foreground">{model?.name ?? '—'}</div>
            <p className="text-sm text-muted-foreground mt-1">{model?.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Theme</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => onJumpToStep(2)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {theme && (
                <div className="flex gap-1">
                  {[theme.swatches.primary, theme.swatches.secondary, theme.swatches.accent].map((c) => (
                    <span
                      key={c}
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}
              <div className="font-medium text-foreground">{theme?.name ?? '—'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sections ({draft.sections.length})</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => onJumpToStep(3)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {draft.sections.map((s, i) => {
                const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === s.type);
                return (
                  <li key={s.type} className="flex items-center gap-3 text-sm">
                    <span className="h-6 w-6 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    <span className="font-medium text-foreground">{def?.name}</span>
                    <Badge variant="outline">{s.variant}</Badge>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Content</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => onJumpToStep(4)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {draft.scrapedUrl ? (
              <p className="text-sm text-muted-foreground">
                We&apos;ll extract content from{' '}
                <span className="text-foreground font-medium">{draft.scrapedUrl}</span>{' '}
                during build.
              </p>
            ) : Object.keys(draft.content).length > 0 ? (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Manual content provided for{' '}
                {Object.keys(draft.content).length} section
                {Object.keys(draft.content).length === 1 ? '' : 's'}.
              </p>
            ) : (
              <p className="text-sm text-yellow-500 inline-flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> No content yet — defaults will be used. You can
                always submit feedback after the first build.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">{model?.name}</span>
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(price)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Includes 5 revision rounds and unlimited preview iterations until you approve.
            </p>
          </CardContent>
        </Card>

        {!isStripeConfigured && (
          <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-foreground">
            <strong>Stripe is not configured yet.</strong> Checkout will use a stub URL —
            wire up <code className="font-mono text-xs">VITE_STRIPE_PK</code> + the
            <code className="font-mono text-xs"> create-checkout</code> edge function before
            launch. See <code className="font-mono text-xs">/HUDSON_TODO.md</code>.
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button size="lg" className="w-full" onClick={handleCheckout} loading={checkingOut}>
          Proceed to payment — {formatCurrency(price)}
        </Button>
      </div>
    </div>
  );
}
