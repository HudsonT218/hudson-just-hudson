import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { AuthShell } from '@/components/configurator/auth/AuthShell';
import { Button } from '@/components/configurator/ui/loading-button';
import { Input, Field } from '@/components/configurator/ui/form-helpers';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY on a recovery link visit.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Also check existing session in case event already fired.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
  }

  return (
    <>
      <Helmet>
        <title>Set new password</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <AuthShell title="Set a new password" subtitle="Choose a password you haven't used before.">
        {done ? (
          <p className="text-sm text-center text-foreground">
            Password updated. Redirecting…
          </p>
        ) : !ready ? (
          <p className="text-sm text-center text-muted-foreground">
            Verifying reset link… If this hangs, the link may have expired.{' '}
            <Link to="/forgot-password" className="text-primary">Request a new one.</Link>
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="New password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm password" htmlFor="confirm" required>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Update password
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
