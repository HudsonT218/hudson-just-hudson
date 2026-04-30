import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Order } from '@/lib/configurator-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, MODEL_DEFINITIONS, THEME_DEFINITIONS } from '@/lib/configurator-constants';
import { formatDate, formatCurrency } from '@/lib/utils';

const STATUS_VARIANT_MAP: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'default'> = {
  paid: 'primary',
  building: 'warning',
  review: 'warning',
  approved: 'success',
  delivered: 'success',
  revision_requested: 'primary',
};

export function OrderCard({ order }: { order: Order }) {
  const model = MODEL_DEFINITIONS.find((m) => m.id === order.spec.model);
  const theme = THEME_DEFINITIONS.find((t) => t.id === order.spec.theme);
  const statusInfo = STATUS_LABELS[order.status];
  const statusVariant = STATUS_VARIANT_MAP[order.status] ?? 'default';

  return (
    <Link to={`/dashboard/order/${order.id}`}>
      <Card className="hover:border-input transition-colors p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground/70">{order.orderNumber}</span>
              <Badge variant={statusVariant}>{statusInfo?.label ?? order.status}</Badge>
            </div>
            <div className="font-semibold text-foreground">{model?.name ?? 'Site'}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {theme?.name ?? '—'} · {order.spec.sections.length} section
              {order.spec.sections.length === 1 ? '' : 's'}
            </div>
            <div className="text-xs text-muted-foreground/70 mt-2">
              Ordered {formatDate(order.createdAt)} ·{' '}
              {order.amountPaid != null ? formatCurrency(order.amountPaid) : '—'}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground/70 shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  );
}
