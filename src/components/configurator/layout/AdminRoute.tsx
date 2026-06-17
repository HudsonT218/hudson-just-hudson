import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import type { ReactNode } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();

  // Wait for initial auth load.
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  // Profile is fetched asynchronously after the session resolves. Don't make
  // an admin-vs-not decision until we actually have it, otherwise we redirect
  // legit admins to the homepage on every nav.
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!profile.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
