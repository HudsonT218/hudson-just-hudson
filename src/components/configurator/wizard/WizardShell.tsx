import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/configurator/ui/loading-button';
import { cn } from '@/lib/utils';

const STEP_LABELS = [
  'Pick a model',
  'Choose a theme',
  'Build sections',
  'Add content',
  'Review & checkout',
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
}

export function WizardShell({
  step,
  totalSteps = 5,
  onPrev,
  onNext,
  nextDisabled,
  nextLabel = 'Next',
  saving,
  lastSavedAt,
  preview,
  children,
}: WizardShellProps) {
  const [previewOpen, setPreviewOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container-page flex items-center justify-between gap-4 py-4">
          <Link to="/dashboard" className="font-bold text-foreground">
            ← Dashboard
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div key={n} className="flex items-center">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border transition-colors',
                    n < step && 'bg-primary text-primary-foreground border-primary',
                    n === step && 'bg-primary/15 text-primary border-primary',
                    n > step && 'bg-background text-muted-foreground/70 border-border',
                  )}
                >
                  {n < step ? <Check className="h-4 w-4" /> : n}
                </span>
                <span
                  className={cn(
                    'ml-2 mr-3 text-xs hidden lg:inline',
                    n === step ? 'text-foreground font-medium' : 'text-muted-foreground/70',
                  )}
                >
                  {STEP_LABELS[n - 1]}
                </span>
                {n < totalSteps && (
                  <span className="h-px w-6 bg-border mr-2 hidden lg:inline-block" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
            {saving ? (
              <span className="inline-flex items-center gap-1">
                <Save className="h-3.5 w-3.5 animate-pulse" /> Saving…
              </span>
            ) : lastSavedAt ? (
              <span>Saved</span>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewOpen((v) => !v)}
              className="hidden lg:inline-flex"
            >
              {previewOpen ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {previewOpen ? 'Hide preview' : 'Show preview'}
            </Button>
          </div>
        </div>
        {/* Mobile step indicator */}
        <div className="md:hidden border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Step {step} of {totalSteps} — {STEP_LABELS[step - 1]}
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className={cn('flex-1 min-w-0', previewOpen ? 'lg:max-w-[60%]' : 'lg:max-w-full')}>
          <div className="container-page py-8 max-w-3xl">{children}</div>
        </div>
        {previewOpen && preview && (
          <aside className="lg:w-[40%] border-l border-border bg-muted">
            <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-auto">
              {preview}
            </div>
          </aside>
        )}
      </div>

      {/* Footer nav */}
      <footer className="border-t border-border bg-background sticky bottom-0">
        <div className="container-page flex items-center justify-between py-4">
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
