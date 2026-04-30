import { Check } from 'lucide-react';
import { THEME_DEFINITIONS } from '@/lib/configurator-constants';
import type { ThemeId } from '@/lib/configurator-types';
import { cn } from '@/lib/utils';

interface StepThemePickerProps {
  selected: ThemeId | null;
  onSelect: (theme: ThemeId) => void;
}

export function StepThemePicker({ selected, onSelect }: StepThemePickerProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Choose a theme</h2>
        <p className="text-muted-foreground mt-1">
          Each theme sets typography, spacing, colors, and shadow style. The preview updates as you click.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {THEME_DEFINITIONS.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={cn(
                'text-left rounded-lg border p-4 transition-all',
                isSelected ? 'border-primary ring-2 ring-ring/30' : 'border-border hover:border-input',
              )}
              style={{ background: t.swatches.bg }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div
                    className="text-base font-bold"
                    style={{ color: t.swatches.text, fontFamily: t.fonts[0] }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-xs mt-0.5 opacity-70"
                    style={{ color: t.swatches.text }}
                  >
                    {t.description}
                  </div>
                </div>
                {isSelected && (
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ml-3">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
              {/* Swatch row */}
              <div className="flex items-center gap-2 mb-3">
                {[t.swatches.primary, t.swatches.secondary, t.swatches.accent, t.swatches.text].map(
                  (c) => (
                    <span
                      key={c}
                      className="h-6 w-6 rounded-full border border-black/10"
                      style={{ background: c }}
                    />
                  ),
                )}
              </div>
              {/* Mini mock */}
              <div className="space-y-1.5">
                <div
                  className="h-3 w-3/4 rounded"
                  style={{ background: t.swatches.text, opacity: 0.85 }}
                />
                <div
                  className="h-2 w-full rounded"
                  style={{ background: t.swatches.text, opacity: 0.4 }}
                />
                <div
                  className="h-2 w-5/6 rounded"
                  style={{ background: t.swatches.text, opacity: 0.4 }}
                />
                <div className="flex gap-2 pt-1">
                  <span
                    className="h-6 w-20 rounded"
                    style={{ background: t.swatches.primary }}
                  />
                  <span
                    className="h-6 w-20 rounded border"
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
