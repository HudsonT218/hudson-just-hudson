import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import type { ReactNode } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!profile?.isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
