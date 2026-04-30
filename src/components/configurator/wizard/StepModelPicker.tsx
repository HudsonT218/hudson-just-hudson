import { Check, Rocket, GalleryHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MODEL_DEFINITIONS } from '@/lib/configurator-constants';
import type { SiteModel } from '@/lib/configurator-types';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  GalleryHorizontal,
};

interface StepModelPickerProps {
  selected: SiteModel | null;
  onSelect: (model: SiteModel) => void;
}

export function StepModelPicker({ selected, onSelect }: StepModelPickerProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Pick your site model</h2>
        <p className="text-muted-foreground mt-1">
          Each model comes with a default section lineup and pricing.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                'text-left rounded-lg border p-5 transition-all',
                isSelected ? 'border-primary ring-2 ring-ring/30 bg-primary/5' : 'border-border bg-card hover:border-input',
                disabled && 'opacity-60 cursor-not-allowed',
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                {disabled ? (
                  <Badge variant="outline">Coming soon</Badge>
                ) : isSelected ? (
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <h3 className="font-semibold text-foreground">{m.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/70">
                <span>
                  {m.defaultSections.length > 0
                    ? `${m.defaultSections.length} sections included`
                    : 'Layouts in progress'}
                </span>
                {!m.comingSoon && (
                  <span className="font-semibold text-foreground">
                    {formatCurrency(m.basePrice)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
