import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Inbox, Settings, Home } from 'lucide-react';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AdminShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isOrders = location.pathname === '/admin' || location.pathname.startsWith('/admin/order');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/5 bg-muted/30 backdrop-blur-md flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <Link to="/admin" className="font-extrabold text-foreground tracking-tight">
            HT
          </Link>
          <div className="text-xs text-muted-foreground mt-1">Admin</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <SidebarLink to="/admin" icon={<Inbox className="h-4 w-4" />} active={isOrders}>
            Orders
          </SidebarLink>
          <SidebarLink to="/admin/settings" icon={<Settings className="h-4 w-4" />} active={location.pathname === '/admin/settings'}>
            Settings
          </SidebarLink>
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Home className="h-4 w-4" /> Client view
          </Link>
          <div className="px-3 py-2 text-xs text-muted-foreground/70 truncate">{profile?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  active,
  children,
}: {
  to: string;
  icon: ReactNode;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/15 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
