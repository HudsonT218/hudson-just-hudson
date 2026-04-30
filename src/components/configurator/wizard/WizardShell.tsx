import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  EyeOff,
  Eye,
  Sparkles,
  PanelBottomOpen,
  PanelBottomClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Model",
  "Theme",
  "Sections",
  "Content",
  "Review",
];

/** How tall the bottom panel should be relative to the preview area. */
export type PanelMode = "compact" | "expanded" | "fullscreen";

interface WizardShellProps {
  step: number;
  totalSteps?: number;
  panelMode?: PanelMode;
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  saving?: boolean;
  lastSavedAt?: string | null;
  preview?: ReactNode;
  children: ReactNode;
  onSaveDraft?: () => void;
  /** Optional: jump to a specific step from the rail (used for completed steps). */
  onJumpToStep?: (n: number) => void;
}

/**
 * Viewport-fitted wizard layout:
 *   - Top: slim step bar
 *   - Middle: full-width preview (dominant)
 *   - Bottom: control panel with the current step's UI
 *
 * The whole layout fits inside `100vh - 4rem` (the navbar height).
 * Inner panels scroll independently if they overflow.
 */
export function WizardShell({
  step,
  totalSteps = 5,
  panelMode = "compact",
  onPrev,
  onNext,
  nextDisabled,
  nextLabel = "Next",
  saving,
  lastSavedAt,
  preview,
  children,
  onSaveDraft,
  onJumpToStep,
}: WizardShellProps) {
  const [previewHidden, setPreviewHidden] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Vertical split between preview and bottom panel.
  // Tailwind's flex-grow ratios: bigger value = more vertical space.
  const previewFlex =
    panelMode === "fullscreen" || previewHidden ? "flex-[0]" : panelMode === "expanded" ? "flex-[4]" : "flex-[7]";
  const panelFlex =
    panelMode === "fullscreen" || previewHidden ? "flex-[1]" : panelMode === "expanded" ? "flex-[6]" : "flex-[3]";

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Step bar — slim, single line */}
      <div className="shrink-0 h-12 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span className="hidden sm:inline">Build your site</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => {
            const isComplete = n < step;
            const isCurrent = n === step;
            const clickable = isComplete && onJumpToStep;
            const Wrapper: React.ElementType = clickable ? "button" : "div";
            return (
              <Wrapper
                key={n}
                onClick={clickable ? () => onJumpToStep(n) : undefined}
                className={cn(
                  "flex items-center gap-2 shrink-0",
                  clickable && "hover:opacity-80 cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold border transition-colors",
                    isComplete && "bg-primary text-primary-foreground border-primary",
                    isCurrent && "bg-primary/15 text-primary border-primary",
                    !isComplete && !isCurrent && "bg-transparent text-muted-foreground/60 border-white/10",
                  )}
                >
                  {isComplete ? <Check className="h-3 w-3" /> : n}
                </span>
                <span
                  className={cn(
                    "hidden md:inline text-xs",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground/70",
                  )}
                >
                  {STEP_LABELS[n - 1]}
                </span>
                {n < totalSteps && (
                  <span className="hidden md:inline-block h-px w-4 bg-white/10 mx-1" />
                )}
              </Wrapper>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          {saving ? (
            <span className="inline-flex items-center gap-1 px-2">
              <Save className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden sm:inline">Saving…</span>
            </span>
          ) : lastSavedAt ? (
            <span className="hidden sm:inline px-2">Saved</span>
          ) : null}
          {onSaveDraft && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveDraft}
              className="h-8 px-2 hidden sm:inline-flex"
            >
              Save draft
            </Button>
          )}
          {preview && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewHidden((v) => !v)}
              aria-label={previewHidden ? "Show preview" : "Hide preview"}
              className="h-8 w-8 p-0 hidden lg:inline-flex"
              title={previewHidden ? "Show preview" : "Hide preview"}
            >
              {previewHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Preview — full width, dominant. Hidden on mobile. */}
      {preview && !previewHidden && panelMode !== "fullscreen" && (
        <div className={cn("hidden lg:block min-h-0", previewFlex)}>
          <div className="h-full">{preview}</div>
        </div>
      )}

      {/* Bottom control panel */}
      <div
        className={cn(
          "min-h-0 border-t border-white/5 bg-background/95 backdrop-blur-md flex flex-col",
          panelFlex,
        )}
      >
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">{children}</div>
        </div>
        <div className="shrink-0 border-t border-white/5 bg-background/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={!onPrev || step === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              {preview && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMobilePreviewOpen(true)}
                  className="lg:hidden"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              {preview && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewHidden((v) => !v)}
                  aria-label={previewHidden ? "Show preview" : "Hide preview"}
                  className="hidden lg:inline-flex h-8 w-8 p-0"
                  title={previewHidden ? "Show preview" : "Hide preview"}
                >
                  {previewHidden ? (
                    <PanelBottomClose className="h-4 w-4" />
                  ) : (
                    <PanelBottomOpen className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <Button onClick={onNext} disabled={nextDisabled || !onNext} size="sm">
              {nextLabel}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile preview overlay */}
      {preview && mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 shrink-0">
            <span className="text-sm font-medium">Live preview</span>
            <Button size="sm" variant="ghost" onClick={() => setMobilePreviewOpen(false)}>
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-auto">{preview}</div>
        </div>
      )}
    </div>
  );
}
