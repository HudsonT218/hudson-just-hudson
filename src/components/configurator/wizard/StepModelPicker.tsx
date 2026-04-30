import { Check, Rocket, GalleryHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MODEL_DEFINITIONS } from "@/lib/configurator-constants";
import type { SiteModel } from "@/lib/configurator-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  GalleryHorizontal,
};

interface StepModelPickerProps {
  selected: SiteModel | null;
  onSelect: (model: SiteModel) => void;
}

/** Compact horizontal model cards — sized to fit in the wizard's bottom panel. */
export function StepModelPicker({ selected, onSelect }: StepModelPickerProps) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground">Pick your site model</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Each model comes with a default section lineup.
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {MODEL_DEFINITIONS.map((m) => {
          const Icon = ICONS[m.icon] ?? Rocket;
          const isSelected = selected === m.id;
          const disabled = m.comingSoon;

          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(m.id)}
              className={cn(
                "snap-start text-left rounded-lg border p-4 transition-all w-[260px] sm:w-[300px] shrink-0",
                isSelected
                  ? "border-primary ring-2 ring-ring/30 bg-primary/5"
                  : "border-border bg-card/40 backdrop-blur-sm hover:border-input hover:bg-card/60",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                {disabled ? (
                  <Badge variant="outline">Coming soon</Badge>
                ) : isSelected ? (
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </div>
              <h3 className="font-semibold text-sm text-foreground">{m.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {m.description}
              </p>
              <div className="mt-2 text-[11px] text-muted-foreground/70">
                {m.defaultSections.length > 0
                  ? `${m.defaultSections.length} sections included`
                  : "Layouts in progress"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
