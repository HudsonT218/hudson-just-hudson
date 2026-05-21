// Re-export of shadcn Button + a `loading` prop, used by the configurator UI.
// The configurator's older code passed variant="primary", map that to shadcn's "default".
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant'> {
  variant?: ButtonVariant;
  loading?: boolean;
}

function mapVariant(v?: ButtonVariant): ShadcnButtonProps['variant'] {
  if (!v || v === 'primary') return 'default';
  if (v === 'default') return 'default';
  return v;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, loading, disabled, className, children, ...rest }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        variant={mapVariant(variant)}
        disabled={disabled || loading}
        className={cn(className)}
        {...rest}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </ShadcnButton>
    );
  },
);
Button.displayName = 'LoadingButton';

export default Button;
