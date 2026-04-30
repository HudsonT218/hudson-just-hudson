import { Rocket, GalleryHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MODEL_DEFINITIONS } from "@/lib/configurator-constants";
import type { SiteModel } from "@/lib/configurator-types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  GalleryHorizontal,
};

interface StepModelPickerProps {
  selected: SiteModel | null;
  onSelect: (model: SiteModel) => void;
}

/**
 * Step 1 strip — compact model pills.
 * Used inside the WizardShell's bottom strip ("strip" mode).
 */
export function StepModelPicker({ selected, onSelect }: StepModelPickerProps) {
  return (
    <>
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
              "shrink-0 inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-medium transition-all",
              isSelected
                ? "border-blue-400 bg-blue-400/10 text-foreground"
                : "border-white/10 bg-card/40 text-muted-foreground hover:text-foreground hover:border-white/20",
              disabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground hover:border-white/10",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{m.name}</span>
            <span className="text-muted-foreground/70">·</span>
            <span className="text-muted-foreground/70">
              {disabled
                ? "Coming soon"
                : `${m.defaultSections.length} sections`}
            </span>
          </button>
        );
      })}
    </>
  );
}
