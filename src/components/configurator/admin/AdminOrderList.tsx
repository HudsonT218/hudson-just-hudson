import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '@/lib/configurator-types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { STATUS_LABELS, MODEL_DEFINITIONS, THEME_DEFINITIONS } from '@/lib/configurator-constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import { supabase, getAllOrders } from '@/lib/configurator-db';
import { cn } from '@/lib/utils';

const FILTERS: Array<{ id: 'all' | OrderStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'building', label: 'Building' },
  { id: 'review', label: 'In Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'revision_requested', label: 'Revision' },
];

const STATUS_VARIANT_MAP: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'default'> = {
  paid: 'primary',
  building: 'warning',
  review: 'warning',
  approved: 'success',
  delivered: 'success',
  revision_requested: 'primary',
};

export function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAllOrders().then((o) => {
      if (cancelled) return;
      setOrders(o);
      setLoading(false);
    });

    // Realtime updates on orders.status
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          getAllOrders().then((o) => {
            if (!cancelled) setOrders(o);
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  return (
    <Card>
      <div className="border-b border-border px-2 py-2 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              filter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent',
            )}
          >
            {f.label}
            {f.id !== 'all' && (
              <span className="ml-1 text-muted-foreground/70">
                ({orders.filter((o) => o.status === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <Th>Order #</Th>
              <Th>Model</Th>
              <Th>Theme</Th>
              <Th>Status</Th>
              <Th>Iter.</Th>
              <Th>Amount</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground/70">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground/70">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const model = MODEL_DEFINITIONS.find((m) => m.id === o.spec.model);
                const theme = THEME_DEFINITIONS.find((t) => t.id === o.spec.theme);
                const status = STATUS_LABELS[o.status];
                const variant = STATUS_VARIANT_MAP[o.status] ?? 'default';
                return (
                  <tr key={o.id} className="border-b border-border hover:bg-accent">
                    <Td>
                      <Link to={`/admin/order/${o.id}`} className="text-primary hover:underline font-mono text-xs">
                        {o.orderNumber}
                      </Link>
                    </Td>
                    <Td>{model?.name ?? '—'}</Td>
                    <Td>{theme?.name ?? '—'}</Td>
                    <Td>
                      <Badge variant={variant}>{status?.label ?? o.status}</Badge>
                    </Td>
                    <Td>{o.iterationCount}/{o.maxIterations}</Td>
                    <Td>{o.amountPaid != null ? formatCurrency(o.amountPaid) : '—'}</Td>
                    <Td>{formatDate(o.createdAt)}</Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-foreground">{children}</td>;
}
