import { Link } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardTopBarProps {
  step: number;
  totalSteps?: number;
  saving?: boolean;
  lastSavedAt?: string | null;
  onSave?: () => void;
  /** Optional: button rendered to the LEFT of "Save" — used for the preview toggle on Mode 3. */
  rightSlot?: React.ReactNode;
  onJumpToStep?: (n: number) => void;
}

/**
 * Slim 30px wizard top bar — replaces the global Navbar inside the wizard.
 * Just an HT mark, the 5-step dot rail, and Save.
 */
export function WizardTopBar({
  step,
  totalSteps = 5,
  saving,
  lastSavedAt,
  onSave,
  rightSlot,
  onJumpToStep,
}: WizardTopBarProps) {
  return (
    <header className="shrink-0 h-[34px] border-b border-white/5 bg-background/85 backdrop-blur-md">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-sm font-extrabold text-foreground tracking-tight hover:opacity-80 transition-opacity"
          style={{ letterSpacing: "-0.03em" }}
        >
          HT
        </Link>

        {/* Center: 5 dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => {
            const complete = n < step;
            const current = n === step;
            const clickable = complete && onJumpToStep;
            return (
              <button
                key={n}
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onJumpToStep(n) : undefined}
                aria-label={`Step ${n}${current ? " (current)" : complete ? " (completed)" : ""}`}
                className={cn(
                  "rounded-full transition-all",
                  clickable && "cursor-pointer hover:opacity-80",
                  current
                    ? "h-2 w-6 bg-blue-400"
                    : complete
                      ? "h-2 w-2 bg-muted-foreground/60"
                      : "h-2 w-2 border border-white/20",
                )}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Save your draft"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{saving ? "Saving" : lastSavedAt ? "Saved" : "Save"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
