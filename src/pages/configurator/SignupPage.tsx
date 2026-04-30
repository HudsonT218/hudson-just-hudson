import { Navigate } from 'react-router-dom';
import { AuthShell } from '@/components/configurator/auth/AuthShell';
import { SignupForm } from '@/components/configurator/auth/SignupForm';
import { useAuth } from '@/components/configurator/auth/AuthProvider';

export default function SignupPage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <AuthShell title="Create your account" subtitle="Two minutes from now you'll have a draft saved.">
      <SignupForm />
    </AuthShell>
  );
}
