import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/configurator/ui/loading-button';
import { Input, Field } from '@/components/configurator/ui/form-helpers';

export function SignupForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 1200);
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <p className="text-emerald-500 font-medium">Check your inbox to confirm your email.</p>
        <p className="text-sm text-muted-foreground mt-2">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Full name" htmlFor="fullName" required>
        <Input
          id="fullName"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </Field>
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
      <Field label="Password" htmlFor="password" required description="At least 8 characters.">
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

      {error && (
        <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        Create account
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
          Log in
        </Link>
      </p>
    </form>
  );
}
