import { useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Save, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Pick a model",
  "Choose a theme",
  "Build sections",
  "Add content",
  "Review & checkout",
];

interface WizardShellProps {
  step: number;
  totalSteps?: number;
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  saving?: boolean;
  lastSavedAt?: string | null;
  preview?: ReactNode;
  children: ReactNode;
  /** Optional save-draft action — visible only when logged in. Returns nothing. */
  onSaveDraft?: () => void;
}

/**
 * Wizard layout — sits BELOW the main site Navbar (which is rendered globally).
 * Provides:
 *  - step rail (sticky under the navbar)
 *  - left content panel + right preview panel split
 *  - mobile preview toggle
 *  - bottom Back/Next bar
 */
export function WizardShell({
  step,
  totalSteps = 5,
  onPrev,
  onNext,
  nextDisabled,
  nextLabel = "Next",
  saving,
  lastSavedAt,
  preview,
  children,
  onSaveDraft,
}: WizardShellProps) {
  const [previewOpen, setPreviewOpen] = useState(true);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Step rail — sits below the global Navbar (h-16 + top-0 = 64px) */}
      <div className="sticky top-16 z-30 backdrop-blur-md border-b border-white/5 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Build your site</span>
          </div>

          {/* Desktop step pills */}
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div key={n} className="flex items-center">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border transition-colors",
                    n < step && "bg-primary text-primary-foreground border-primary",
                    n === step && "bg-primary/15 text-primary border-primary",
                    n > step && "bg-transparent text-muted-foreground/60 border-white/10",
                  )}
                >
                  {n < step ? <Check className="h-3.5 w-3.5" /> : n}
                </span>
                <span
                  className={cn(
                    "ml-2 mr-3 text-xs hidden xl:inline",
                    n === step ? "text-foreground font-medium" : "text-muted-foreground/70",
                  )}
                >
                  {STEP_LABELS[n - 1]}
                </span>
                {n < totalSteps && (
                  <span className="h-px w-6 bg-white/10 mr-2 hidden xl:inline-block" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {saving ? (
              <span className="inline-flex items-center gap-1">
                <Save className="h-3.5 w-3.5 animate-pulse" /> Saving…
              </span>
            ) : lastSavedAt ? (
              <span>Saved</span>
            ) : null}
            {onSaveDraft && (
              <Button size="sm" variant="ghost" onClick={onSaveDraft} className="hidden sm:inline-flex">
                Save draft
              </Button>
            )}
            {preview && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreviewOpen((v) => !v)}
                className="hidden lg:inline-flex"
              >
                {previewOpen ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {previewOpen ? "Hide preview" : "Show preview"}
              </Button>
            )}
          </div>
        </div>
        {/* Mobile step indicator */}
        <div className="md:hidden border-t border-white/5 px-4 py-2 text-xs text-muted-foreground">
          Step {step} of {totalSteps} — {STEP_LABELS[step - 1]}
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className={cn("flex-1 min-w-0", previewOpen && preview ? "lg:max-w-[60%]" : "lg:max-w-full")}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</div>
        </div>
        {previewOpen && preview && (
          <aside className="hidden lg:block lg:w-[40%] border-l border-white/5 bg-muted/30">
            <div className="sticky top-[7.5rem] h-[calc(100vh-7.5rem)] overflow-auto">
              {preview}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile preview toggle (full-screen overlay) */}
      {preview && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setMobilePreviewOpen(true)}
            className="lg:hidden fixed bottom-20 right-4 z-40 shadow-lg"
          >
            <Eye className="h-4 w-4 mr-1" /> Preview
          </Button>
          {mobilePreviewOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <span className="text-sm font-medium">Live preview</span>
                <Button size="sm" variant="ghost" onClick={() => setMobilePreviewOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="flex-1 overflow-auto">{preview}</div>
            </div>
          )}
        </>
      )}

      {/* Footer nav */}
      <footer className="border-t border-white/5 bg-background/80 backdrop-blur-md sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={onPrev} disabled={!onPrev || step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={onNext} disabled={nextDisabled || !onNext}>
            {nextLabel}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
