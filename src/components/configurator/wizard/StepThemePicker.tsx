import { Check } from "lucide-react";
import { THEME_DEFINITIONS } from "@/lib/configurator-constants";
import type { ThemeId } from "@/lib/configurator-types";
import { cn } from "@/lib/utils";

interface StepThemePickerProps {
  selected: ThemeId | null;
  onSelect: (theme: ThemeId) => void;
}

/** Compact horizontal theme cards — sized for the wizard's bottom panel. */
export function StepThemePicker({ selected, onSelect }: StepThemePickerProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">Choose a theme</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Each theme sets typography, color, and spacing. The preview updates as you click.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {THEME_DEFINITIONS.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={cn(
                "snap-start text-left rounded-lg border p-3 transition-all w-[200px] sm:w-[220px] shrink-0 relative",
                isSelected
                  ? "border-primary ring-2 ring-ring/30"
                  : "border-border hover:border-input",
              )}
              style={{ background: t.swatches.bg }}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <div className="mb-2 pr-6">
                <div
                  className="text-sm font-bold leading-tight"
                  style={{ color: t.swatches.text, fontFamily: t.fonts[0] }}
                >
                  {t.name}
                </div>
                <div
                  className="text-[11px] mt-0.5 opacity-70 line-clamp-2"
                  style={{ color: t.swatches.text }}
                >
                  {t.description}
                </div>
              </div>
              {/* Swatch row */}
              <div className="flex items-center gap-1.5 mb-2">
                {[t.swatches.primary, t.swatches.secondary, t.swatches.accent].map((c) => (
                  <span
                    key={c}
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              {/* Mini mock */}
              <div className="space-y-1">
                <div
                  className="h-2 w-3/4 rounded-sm"
                  style={{ background: t.swatches.text, opacity: 0.75 }}
                />
                <div
                  className="h-1.5 w-full rounded-sm"
                  style={{ background: t.swatches.text, opacity: 0.35 }}
                />
                <div className="flex gap-1.5 pt-0.5">
                  <span
                    className="h-4 w-12 rounded-sm"
                    style={{ background: t.swatches.primary }}
                  />
                  <span
                    className="h-4 w-12 rounded-sm border"
                    style={{ borderColor: t.swatches.text, opacity: 0.4 }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
