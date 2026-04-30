import { THEME_DEFINITIONS } from "@/lib/configurator-constants";
import type { ThemeId } from "@/lib/configurator-types";
import { cn } from "@/lib/utils";

interface StepThemePickerProps {
  selected: ThemeId | null;
  onSelect: (theme: ThemeId) => void;
}

/**
 * Step 2 strip — compact theme pills with 3-dot swatch.
 * Used inside the WizardShell's bottom strip ("strip" mode).
 */
export function StepThemePicker({ selected, onSelect }: StepThemePickerProps) {
  return (
    <>
      {THEME_DEFINITIONS.map((t) => {
        const isSelected = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-medium transition-all",
              isSelected
                ? "border-blue-400 bg-blue-400/10 text-foreground"
                : "border-white/10 bg-card/40 text-muted-foreground hover:text-foreground hover:border-white/20",
            )}
            aria-pressed={isSelected}
          >
            <span className="flex items-center -space-x-0.5">
              {[t.swatches.primary, t.swatches.secondary, t.swatches.accent].map((c, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full border border-black/20"
                  style={{ background: c }}
                />
              ))}
            </span>
            <span>{t.name}</span>
          </button>
        );
      })}
    </>
  );
}
