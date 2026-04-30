import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WizardTopBar } from "./WizardTopBar";

/**
 * Three layout modes:
 *   - "strip"  → Steps 1, 2 — preview fills viewport, ~40px strip of pills at the bottom
 *   - "panel"  → Step 3     — preview ~60% top, ~140px expanded panel below for chips
 *   - "form"   → Steps 4, 5 — left form area + narrow right preview, vertical scroll allowed
 */
export type WizardLayoutMode = "strip" | "panel" | "form";

interface WizardShellProps {
  step: number;
  totalSteps?: number;
  mode: WizardLayoutMode;
  onPrev?: () => void;
  onNext?: () => void;
  onJumpToStep?: (n: number) => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  saving?: boolean;
  lastSavedAt?: string | null;
  onSaveDraft?: () => void;

  /** Live preview area (always rendered as the wizard's visual focus, except when togged off). */
  preview: ReactNode;

  /** Content for the bottom strip — used when mode === "strip". */
  stripContent?: ReactNode;

  /** Content for the bottom panel — used when mode === "panel". */
  panelContent?: ReactNode;

  /** Content for the form — used when mode === "form".
   *  Receives the layout helpers (preview shown / hidden + section nav slot). */
  formContent?: ReactNode;
}

export function WizardShell({
  step,
  totalSteps = 5,
  mode,
  onPrev,
  onNext,
  onJumpToStep,
  nextDisabled,
  nextLabel = "Next",
  saving,
  lastSavedAt,
  onSaveDraft,
  preview,
  stripContent,
  panelContent,
  formContent,
}: WizardShellProps) {
  // Form mode: optional toggle for the right preview panel.
  const [formPreviewVisible, setFormPreviewVisible] = useState(true);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Reset mobile overlay when step changes
  useEffect(() => setMobilePreviewOpen(false), [step]);

  return (
    <div
      className={cn(
        "flex flex-col bg-background text-foreground",
        // Steps 1-3 are viewport-locked; Step 4-5 may scroll.
        mode === "form" ? "min-h-screen" : "h-screen overflow-hidden",
      )}
    >
      <WizardTopBar
        step={step}
        totalSteps={totalSteps}
        saving={saving}
        lastSavedAt={lastSavedAt}
        onSave={onSaveDraft}
        onJumpToStep={onJumpToStep}
        rightSlot={
          mode === "form" ? (
            <button
              type="button"
              onClick={() => setFormPreviewVisible((v) => !v)}
              className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title={formPreviewVisible ? "Hide preview" : "Show preview"}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{formPreviewVisible ? "Hide preview" : "Preview"}</span>
            </button>
          ) : null
        }
      />

      {mode === "strip" && (
        <>
          {/* Preview — fills all remaining vertical space */}
          <div className="hidden md:block flex-1 min-h-0 overflow-hidden">
            {preview}
          </div>

          {/* Mobile shows controls only; preview behind a button */}
          <div className="md:hidden flex-1 overflow-auto p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Tap Preview to see your live build.
            </p>
          </div>

          {/* Bottom strip ~40px */}
          <BottomStrip
            onPrev={onPrev}
            onNext={onNext}
            nextDisabled={nextDisabled}
            nextLabel={nextLabel}
          >
            <div className="flex-1 min-w-0 overflow-x-auto">
              <div className="flex items-center gap-2 px-1 whitespace-nowrap">{stripContent}</div>
            </div>
          </BottomStrip>
        </>
      )}

      {mode === "panel" && (
        <>
          {/* Preview — takes ~60% of remaining height */}
          <div className="hidden md:flex flex-[3] min-h-0 overflow-hidden">{preview}</div>

          <div className="md:hidden flex-1 overflow-auto" />

          {/* Expanded panel — ~140px tall */}
          <div className="border-t border-white/5 bg-background/95 backdrop-blur-md">
            <div className="px-4 sm:px-6 py-3 max-h-[180px] overflow-auto">
              {panelContent}
            </div>
          </div>

          <BottomStrip
            onPrev={onPrev}
            onNext={onNext}
            nextDisabled={nextDisabled}
            nextLabel={nextLabel}
          />
        </>
      )}

      {mode === "form" && (
        <div className="flex-1 flex flex-col md:flex-row">
          <main
            className={cn(
              "flex-1 min-w-0",
              formPreviewVisible && "md:border-r md:border-white/5",
            )}
          >
            {formContent}
            {/* Footer nav for form mode */}
            <div className="border-t border-white/5 bg-background/85 backdrop-blur-md sticky bottom-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={onPrev} disabled={!onPrev || step === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button onClick={onNext} disabled={nextDisabled || !onNext} size="sm">
                  {nextLabel}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </main>

          {formPreviewVisible && (
            <aside className="hidden md:block md:w-[34%] lg:w-[32%] xl:w-[30%] shrink-0 sticky top-[34px] h-[calc(100vh-34px)] bg-muted/20">
              <div className="h-full overflow-hidden">{preview}</div>
            </aside>
          )}
        </div>
      )}

      {/* Mobile preview floating button + overlay (any mode) */}
      <button
        type="button"
        onClick={() => setMobilePreviewOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 h-12 px-4 rounded-full bg-primary text-primary-foreground shadow-lg inline-flex items-center gap-2 text-sm font-semibold"
        aria-label="Show preview"
      >
        <Eye className="h-4 w-4" />
        Preview
      </button>
      {mobilePreviewOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col">
          <div className="shrink-0 h-12 border-b border-white/5 flex items-center justify-between px-4">
            <span className="text-sm font-medium">Preview</span>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="p-1 rounded-md hover:bg-accent"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">{preview}</div>
        </div>
      )}
    </div>
  );
}

interface BottomStripProps {
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  children?: ReactNode;
}

function BottomStrip({ onPrev, onNext, nextDisabled, nextLabel = "Next", children }: BottomStripProps) {
  return (
    <div className="shrink-0 h-12 border-t border-white/5 bg-background/95 backdrop-blur-md">
      <div className="h-full px-2 sm:px-4 flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onPrev}
          disabled={!onPrev}
          className="h-8 w-8 p-0 shrink-0"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {children}
        <Button onClick={onNext} disabled={nextDisabled || !onNext} size="sm" className="shrink-0">
          {nextLabel}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
