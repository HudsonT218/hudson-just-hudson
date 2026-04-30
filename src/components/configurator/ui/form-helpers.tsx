// Form helpers used across the configurator wizard + dashboard.
// Re-exports shadcn primitives and adds a `Field` wrapper that pairs Label + helper text.
import type { ReactNode } from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { Label as ShadcnLabel } from '@/components/ui/label';

export const Input = ShadcnInput;
export const Textarea = ShadcnTextarea;
export const Label = ShadcnLabel;

interface FieldProps {
  label?: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, description, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={htmlFor}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground/80">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
