import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { AuthShell } from '@/components/configurator/auth/AuthShell';
import { Button } from '@/components/configurator/ui/loading-button';
import { Input, Field } from '@/components/configurator/ui/form-helpers';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <>
      <Helmet>
        <title>Forgot password</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <AuthShell title="Reset your password" subtitle="We'll email you a link to set a new password.">
        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-foreground">
              Check <span className="font-medium">{email}</span> for a reset link.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn't get it? Check spam, or try again in a minute.
            </p>
            <Link to="/login" className="text-sm text-primary hover:text-primary-hover font-medium inline-block">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Send reset link
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              <Link to="/login" className="hover:text-foreground">← Back to login</Link>
            </p>
          </form>
        )}
      </AuthShell>
    </>
  );
}
