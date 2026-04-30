import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import { DashboardShell } from '@/components/configurator/dashboard/DashboardShell';
import { OrderCard } from '@/components/configurator/dashboard/OrderCard';
import { Button } from '@/components/configurator/ui/loading-button';
import { Card } from '@/components/ui/card';
import { getOrders, getDrafts, deleteDraft } from '@/lib/configurator-db';
import type { Order, Draft } from '@/lib/configurator-types';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getOrders(user.id), getDrafts(user.id)]).then(([o, d]) => {
      if (cancelled) return;
      setOrders(o);
      setDrafts(d);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function onDeleteDraft(id: string) {
    await deleteDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your work</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pick up where you left off, or start a new build.
          </p>
        </div>
        <Link to="/configure">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> New build
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-10">
          {/* Drafts */}
          {drafts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
                In progress
              </h2>
              <div className="space-y-3">
                {drafts.map((d) => (
                  <Card key={d.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground/70" />
                      <div>
                        <div className="font-medium text-foreground">{d.name}</div>
                        <div className="text-xs text-muted-foreground/70">
                          {d.model ?? 'No model yet'} · Step {d.currentStep} · last edited{' '}
                          {formatDate(d.updatedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/configure/${d.id}`}>
                        <Button size="sm" variant="outline">
                          Resume
                        </Button>
                      </Link>
                      <button
                        onClick={() => onDeleteDraft(d.id)}
                        className="p-2 text-muted-foreground/70 hover:text-destructive rounded-md transition-colors"
                        aria-label="Delete draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Orders */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
              Orders
            </h2>
            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">You don&apos;t have any orders yet.</p>
                <Link to="/configure" className="inline-block mt-3">
                  <Button>Start your first build</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
