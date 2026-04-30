import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import { useDraft } from '@/hooks/use-draft';
import { WizardShell } from '@/components/configurator/wizard/WizardShell';
import { StepModelPicker } from '@/components/configurator/wizard/StepModelPicker';
import { StepThemePicker } from '@/components/configurator/wizard/StepThemePicker';
import { StepSectionBuilder } from '@/components/configurator/wizard/StepSectionBuilder';
import { StepContentIntake } from '@/components/configurator/wizard/StepContentIntake';
import { StepReviewCheckout } from '@/components/configurator/wizard/StepReviewCheckout';
import { LivePreview } from '@/components/configurator/preview/LivePreview';
import { MODEL_DEFINITIONS, SECTION_TYPE_DEFINITIONS } from '@/lib/configurator-constants';
import { generateOrderNumber } from '@/lib/utils';
import { createOrder } from '@/lib/configurator-db';
import { isStripeConfigured } from '@/lib/stripe';
import type { SectionSelection, SiteModel, ThemeId, SiteSpec } from '@/lib/configurator-types';

const TOTAL_STEPS = 5;

export default function ConfiguratorPage() {
  const { user } = useAuth();
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();

  const { draft, hydrating, saving, lastSavedAt, update, merge, flush } = useDraft({
    userId: user?.id ?? null,
    draftId,
  });

  // Local step state — synced into draft.currentStep
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (!hydrating && draft.currentStep) setStep(draft.currentStep);
  }, [hydrating, draft.currentStep]);

  // Apply theme tokens to root for whole-app preview consistency.
  useEffect(() => {
    if (draft.theme) {
      document.documentElement.dataset.theme = draft.theme;
    }
  }, [draft.theme]);

  function gotoStep(n: number) {
    const clamped = Math.min(Math.max(n, 1), TOTAL_STEPS);
    setStep(clamped);
    update('currentStep', clamped);
  }

  function pickModel(model: SiteModel) {
    const def = MODEL_DEFINITIONS.find((m) => m.id === model);
    if (!def) return;
    // Pre-populate default sections only if user hasn't built any yet
    const sections: SectionSelection[] =
      draft.sections.length > 0
        ? draft.sections
        : def.defaultSections.map((type, order) => {
            const sectionDef = SECTION_TYPE_DEFINITIONS.find((d) => d.id === type)!;
            return { type, variant: sectionDef.defaultVariant, order };
          });
    merge({ model, sections });
  }

  const spec: SiteSpec = useMemo(
    () => ({
      model: draft.model ?? 'landing',
      theme: draft.theme ?? 'clean-modern',
      sections: draft.sections,
      content: draft.content,
    }),
    [draft.model, draft.theme, draft.sections, draft.content],
  );

  const nextDisabled = (() => {
    switch (step) {
      case 1:
        return !draft.model;
      case 2:
        return !draft.theme;
      case 3:
        return draft.sections.length === 0;
      default:
        return false;
    }
  })();

  async function handleCheckout() {
    if (!user) return;
    // Save the draft one more time before creating the order.
    const savedDraft = await flush();

    if (!isStripeConfigured) {
      // Stub flow — create the order directly so the rest of the app can be exercised.
      const orderNumber = generateOrderNumber();
      const order = await createOrder({
        userId: user.id,
        draftId: savedDraft?.id ?? null,
        spec,
        amountPaid:
          MODEL_DEFINITIONS.find((m) => m.id === draft.model)?.basePrice ?? 0,
        orderNumber,
      });
      if (order) {
        navigate(`/dashboard/order/${order.id}`);
      } else {
        throw new Error(
          'Stub order creation failed. Connect Supabase first (see HUDSON_TODO.md).',
        );
      }
      return;
    }

    // Real flow — call the Supabase Edge Function for a Stripe Checkout session.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spec,
        draftId: savedDraft?.id,
        userId: user.id,
      }),
    });
    if (!res.ok) throw new Error('Could not start checkout');
    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  }

  const previewPanel = <LivePreview spec={spec} />;

  if (hydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading your draft…
      </div>
    );
  }

  return (
    <WizardShell
      step={step}
      totalSteps={TOTAL_STEPS}
      saving={saving}
      lastSavedAt={lastSavedAt}
      onPrev={step > 1 ? () => gotoStep(step - 1) : undefined}
      onNext={
        step < TOTAL_STEPS
          ? () => gotoStep(step + 1)
          : undefined
      }
      nextDisabled={nextDisabled}
      preview={previewPanel}
    >
      {step === 1 && (
        <StepModelPicker selected={draft.model} onSelect={pickModel} />
      )}
      {step === 2 && (
        <StepThemePicker
          selected={draft.theme}
          onSelect={(theme: ThemeId) => update('theme', theme)}
        />
      )}
      {step === 3 && (
        <StepSectionBuilder
          sections={draft.sections}
          onChange={(s) => update('sections', s)}
        />
      )}
      {step === 4 && (
        <StepContentIntake
          sections={draft.sections}
          content={draft.content}
          scrapedUrl={draft.scrapedUrl}
          onContentChange={(c) => update('content', c)}
          onScrapedUrlChange={(u) => update('scrapedUrl', u)}
        />
      )}
      {step === 5 && (
        <StepReviewCheckout
          draft={draft}
          onJumpToStep={gotoStep}
          onCheckout={handleCheckout}
        />
      )}
    </WizardShell>
  );
}
