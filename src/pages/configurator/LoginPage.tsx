import { Navigate } from 'react-router-dom';
import { AuthShell } from '@/components/configurator/auth/AuthShell';
import { LoginForm } from '@/components/configurator/auth/LoginForm';
import { useAuth } from '@/components/configurator/auth/AuthProvider';

export default function LoginPage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep building.">
      <LoginForm />
    </AuthShell>
  );
}
