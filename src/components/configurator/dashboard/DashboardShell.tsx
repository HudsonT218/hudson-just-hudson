import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import { Button } from '@/components/configurator/ui/loading-button';

export function DashboardShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container-page flex items-center justify-between py-4">
          <Link to="/dashboard" className="font-bold text-foreground">
            Hudson Turansky
          </Link>
          <div className="flex items-center gap-3">
            {profile?.isAdmin && (
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile?.fullName ?? profile?.email}
            </span>
            <Button size="sm" variant="ghost" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
