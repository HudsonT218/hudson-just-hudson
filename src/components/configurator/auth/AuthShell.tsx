import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container-page flex items-center justify-between py-5">
          <Link to="/" className="font-bold text-lg text-foreground">
            Hudson Turansky
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
