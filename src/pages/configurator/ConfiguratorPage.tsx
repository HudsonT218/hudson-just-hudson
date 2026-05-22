import "@/component-library/themes/clean-modern.css";
import "@/component-library/themes/bold-dark.css";
import "@/component-library/themes/warm-minimal.css";
import "@/component-library/themes/corporate-sharp.css";
import "@/component-library/themes/vibrant-startup.css";
import "@/component-library/themes/elegant-luxury.css";
import "@/component-library/themes/nature-organic.css";
import "@/component-library/themes/tech-developer.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/components/configurator/auth/AuthProvider";
import { useDraft } from "@/hooks/use-draft";
import { WizardShell, type WizardLayoutMode } from "@/components/configurator/wizard/WizardShell";
import { StepModelPicker } from "@/components/configurator/wizard/StepModelPicker";
import { StepThemePicker } from "@/components/configurator/wizard/StepThemePicker";
import { StepSectionBuilder } from "@/components/configurator/wizard/StepSectionBuilder";
import { StepContentIntake } from "@/components/configurator/wizard/StepContentIntake";
import { StepReviewCheckout } from "@/components/configurator/wizard/StepReviewCheckout";
import { LivePreview } from "@/components/configurator/preview/LivePreview";
import { AuthGateDialog } from "@/components/configurator/auth/AuthGateDialog";
import {
  MODEL_DEFINITIONS,
  SECTION_TYPE_DEFINITIONS,
} from "@/lib/configurator-constants";
import { generateOrderNumber } from "@/lib/utils";
import { createOrder } from "@/lib/configurator-db";
import { isStripeConfigured } from "@/lib/stripe";
import { useForceDark } from "@/lib/useForceDark";
import type {
  SectionSelection,
  SiteModel,
  ThemeId,
  SiteSpec,
} from "@/lib/configurator-types";

const TOTAL_STEPS = 5;
/** Steps 1-3 are open. Step 4 (Content) is the auth gate. */
const AUTH_GATE_STEP = 4;

const STEP_MODES: Record<number, WizardLayoutMode> = {
  1: "strip",
  2: "strip",
  3: "panel",
  4: "form",
  5: "form",
};

export default function ConfiguratorPage() {
  useForceDark();
  const { user, loading: authLoading } = useAuth();
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();

  const { draft, hydrating, saving, lastSavedAt, update, merge, flush } = useDraft({
    userId: user?.id ?? null,
    draftId,
  });

  const [step, setStep] = useState(1);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrating && draft.currentStep) setStep(draft.currentStep);
  }, [hydrating, draft.currentStep]);

  useEffect(() => {
    if (draft.theme) {
      document.documentElement.dataset.theme = draft.theme;
    }
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [draft.theme]);

  function gotoStep(n: number) {
    const clamped = Math.min(Math.max(n, 1), TOTAL_STEPS);
    if (clamped >= AUTH_GATE_STEP && !user) {
      setPendingStep(clamped);
      setAuthGateOpen(true);
      return;
    }
    setStep(clamped);
    update("currentStep", clamped);
  }

  useEffect(() => {
    if (user && pendingStep !== null) {
      setStep(pendingStep);
      update("currentStep", pendingStep);
      setPendingStep(null);
    }
  }, [user, pendingStep, update]);

  function pickModel(model: SiteModel) {
    const def = MODEL_DEFINITIONS.find((m) => m.id === model);
    if (!def || def.comingSoon) return;
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
      model: draft.model ?? "landing",
      theme: draft.theme ?? "clean-modern",
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

  function handleSaveDraft() {
    if (!user) {
      setAuthGateOpen(true);
      return;
    }
    void flush();
  }

  async function handleCheckout() {
    if (!user) {
      setAuthGateOpen(true);
      return;
    }
    const savedDraft = await flush();

    if (!isStripeConfigured) {
      const orderNumber = generateOrderNumber();
      const order = await createOrder({
        userId: user.id,
        draftId: savedDraft?.id ?? null,
        spec,
        amountPaid: MODEL_DEFINITIONS.find((m) => m.id === draft.model)?.basePrice ?? 0,
        orderNumber,
      });
      if (order) {
        navigate(`/dashboard/order/${order.id}`);
      } else {
        throw new Error(
          "Stub order creation failed. Connect Supabase first (see HUDSON_TODO.md).",
        );
      }
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spec,
        draftId: savedDraft?.id,
        userId: user.id,
      }),
    });
    if (!res.ok) throw new Error("Could not start checkout");
    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  }

  const previewPanel = <LivePreview spec={spec} />;
  const mode = STEP_MODES[step] ?? "strip";

  if (hydrating || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Build Your Site · Hudson Turansky</title>
        <meta
          name="description"
          content="Configure your custom landing page in minutes. Pick a theme, choose sections, and our AI builds it."
        />
      </Helmet>

      <WizardShell
        step={step}
        totalSteps={TOTAL_STEPS}
        mode={mode}
        saving={saving}
        lastSavedAt={lastSavedAt}
        onPrev={step > 1 ? () => gotoStep(step - 1) : undefined}
        onNext={step < TOTAL_STEPS ? () => gotoStep(step + 1) : undefined}
        onJumpToStep={gotoStep}
        nextDisabled={nextDisabled}
        preview={previewPanel}
        onSaveDraft={handleSaveDraft}
        stripContent={
          step === 1 ? (
            <StepModelPicker selected={draft.model} onSelect={pickModel} />
          ) : step === 2 ? (
            <StepThemePicker
              selected={draft.theme}
              onSelect={(theme: ThemeId) => update("theme", theme)}
            />
          ) : null
        }
        panelContent={
          step === 3 ? (
            <StepSectionBuilder
              sections={draft.sections}
              onChange={(s) => update("sections", s)}
            />
          ) : null
        }
        formContent={
          step === 4 ? (
            <StepContentIntake
              sections={draft.sections}
              content={draft.content}
              scrapedUrl={draft.scrapedUrl}
              onContentChange={(c) => update("content", c)}
              onScrapedUrlChange={(u) => update("scrapedUrl", u)}
            />
          ) : step === 5 ? (
            <StepReviewCheckout
              draft={draft}
              onJumpToStep={gotoStep}
              onCheckout={handleCheckout}
            />
          ) : null
        }
      />

      <AuthGateDialog
        open={authGateOpen}
        onOpenChange={setAuthGateOpen}
        title="Sign in to keep going"
        description="Step 4 needs an account so we can save your draft and process your order. Your selections so far are kept."
      />
    </>
  );
}
