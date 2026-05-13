import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import type { ReactNode } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  // Only block on the very first auth load (no user known yet).
  // Once we have a user cached in context, navigations are instant.
  if (loading && !user) {
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
