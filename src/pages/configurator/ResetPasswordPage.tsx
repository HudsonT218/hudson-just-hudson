import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { AuthShell } from '@/components/configurator/auth/AuthShell';
import { Button } from '@/components/configurator/ui/loading-button';
import { Input, Field } from '@/components/configurator/ui/form-helpers';

type Status = 'verifying' | 'ready' | 'invalid';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  const [invalidReason, setInvalidReason] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Listen for PASSWORD_RECOVERY (fired when Supabase parses a hash-based recovery link)
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setStatus('ready');
      }
    });

    (async () => {
      try {
        // 1) PKCE / magic-link style: ?code=...
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (error) {
            setInvalidReason(error.message);
            setStatus('invalid');
            return;
          }
          setStatus('ready');
          return;
        }

        // 2) Error returned in URL hash (e.g. expired link)
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) {
          if (cancelled) return;
          setInvalidReason(decodeURIComponent(hashError.replace(/\+/g, ' ')));
          setStatus('invalid');
          return;
        }

        // 3) Hash-based recovery token — Supabase parses it on load.
        // Give it a brief window to fire PASSWORD_RECOVERY / set the session.
        const hasRecoveryHash = hash.includes('access_token') || hashParams.get('type') === 'recovery';

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          setStatus('ready');
          return;
        }

        if (hasRecoveryHash) {
          // Wait briefly for onAuthStateChange to fire.
          setTimeout(async () => {
            if (cancelled) return;
            const { data: d2 } = await supabase.auth.getSession();
            if (cancelled) return;
            if (d2.session) setStatus('ready');
            else {
              setInvalidReason('This reset link is invalid or has expired.');
              setStatus('invalid');
            }
          }, 1500);
          return;
        }

        // No code, no hash — nothing to verify.
        setInvalidReason('This reset link is missing or has expired.');
        setStatus('invalid');
      } catch (e) {
        if (cancelled) return;
        setInvalidReason(e instanceof Error ? e.message : 'Unable to verify reset link.');
        setStatus('invalid');
      }
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [searchParams]);

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
        ) : status === 'verifying' ? (
          <p className="text-sm text-center text-muted-foreground">
            Verifying reset link…
          </p>
        ) : status === 'invalid' ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {invalidReason ?? 'This reset link is invalid or has expired.'}
            </p>
            <p className="text-sm text-muted-foreground">
              <Link to="/forgot-password" className="text-primary">Request a new reset link.</Link>
            </p>
          </div>
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
