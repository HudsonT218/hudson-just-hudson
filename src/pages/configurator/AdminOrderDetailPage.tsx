import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, RotateCcw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { AdminShell } from '@/components/configurator/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/configurator/ui/loading-button';
import { Badge } from '@/components/ui/badge';
import { Textarea, Field } from '@/components/configurator/ui/form-helpers';
import {
  getOrder,
  getFeedbackForOrder,
  updateOrderStatus,
  supabase,
} from '@/lib/configurator-db';
import type { Order, Feedback, OrderStatus } from '@/lib/configurator-types';
import { STATUS_LABELS, MODEL_DEFINITIONS, THEME_DEFINITIONS, SECTION_TYPE_DEFINITIONS } from '@/lib/configurator-constants';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

const STATUS_OPTIONS: OrderStatus[] = [
  'paid',
  'building',
  'review',
  'approved',
  'delivered',
  'revision_requested',
];

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
};

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<Device>('desktop');
  const [reviewNotes, setReviewNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getOrder(orderId), getFeedbackForOrder(orderId)]).then(([o, f]) => {
      if (cancelled) return;
      setOrder(o);
      setFeedback(f);
      setReviewNotes(o?.reviewNotes ?? '');
      setLoading(false);
    });

    const channel = supabase
      .channel(`admin-order-${orderId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function refresh() {
    if (!orderId) return;
    const [o, f] = await Promise.all([getOrder(orderId), getFeedbackForOrder(orderId)]);
    setOrder(o);
    setFeedback(f);
  }

  async function changeStatus(newStatus: OrderStatus) {
    if (!order) return;
    setActioning(true);
    const patch: Record<string, unknown> = { reviewed_at: new Date().toISOString() };
    if (newStatus === 'building') {
      patch.build_started_at = new Date().toISOString();
    }
    if (newStatus === 'review') {
      patch.build_completed_at = new Date().toISOString();
    }
    await updateOrderStatus(order.id, newStatus, patch);

    // When admin approves, notify the client.
    if (newStatus === 'approved' && order.previewUrl) {
      try {
        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', order.userId)
          .single();
        if (clientProfile?.email) {
          const isRevision = order.iterationCount > 0;
          await supabase.functions.invoke('notify-preview-ready', {
            body: {
              customerEmail: clientProfile.email,
              customerName: clientProfile.full_name ?? undefined,
              orderNumber: order.orderNumber,
              previewUrl: order.previewUrl,
              iterationsRemaining: order.maxIterations - order.iterationCount,
              isRevision,
              iterationNumber: order.iterationCount,
              maxIterations: order.maxIterations,
            },
          });
        }
      } catch (e) {
        console.warn('[admin] notify-preview-ready failed:', e);
      }
    }

    setActioning(false);
    refresh();
  }

  async function saveReviewNotes() {
    if (!order) return;
    setSavingNotes(true);
    await supabase
      .from('orders')
      .update({ review_notes: reviewNotes, updated_at: new Date().toISOString() })
      .eq('id', order.id);
    setSavingNotes(false);
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="p-6">Loading…</div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell>
        <div className="p-6">
          <p className="text-foreground">Order not found.</p>
          <Link to="/admin">
            <Button variant="outline" className="mt-3">
              Back to orders
            </Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const model = MODEL_DEFINITIONS.find((m) => m.id === order.spec.model);
  const theme = THEME_DEFINITIONS.find((t) => t.id === order.spec.theme);
  const status = STATUS_LABELS[order.status];

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Orders
          </Link>
          <span className="text-muted-foreground/70">·</span>
          <span className="font-mono text-xs text-muted-foreground/70">{order.orderNumber}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left — info */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{model?.name}</CardTitle>
                  <Badge>{status?.label ?? order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Theme" value={theme?.name ?? '—'} />
                <Row label="Sections" value={`${order.spec.sections.length}`} />
                <Row label="Amount paid" value={order.amountPaid != null ? formatCurrency(order.amountPaid) : '—'} />
                <Row label="Iterations" value={`${order.iterationCount} / ${order.maxIterations}`} />
                <Row label="Ordered" value={formatDate(order.createdAt)} />
                {order.buildStartedAt && <Row label="Build started" value={formatDate(order.buildStartedAt)} />}
                {order.buildCompletedAt && <Row label="Build done" value={formatDate(order.buildCompletedAt)} />}
                {order.reviewedAt && <Row label="Reviewed" value={formatDate(order.reviewedAt)} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status override</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={order.status}
                  onChange={(e) => changeStatus(e.target.value as OrderStatus)}
                  disabled={actioning}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus-visible:ring-ring"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]?.label ?? s}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-1.5 text-sm">
                  {order.spec.sections.map((s, i) => {
                    const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === s.type);
                    return (
                      <li key={`${s.type}-${i}`} className="flex items-center gap-2">
                        <span className="text-muted-foreground/70 text-xs w-5">{i + 1}.</span>
                        <span className="font-medium text-foreground">{def?.name}</span>
                        <span className="text-muted-foreground/70 text-xs">· {s.variant}</span>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Field label="" htmlFor="notes">
                  <Textarea
                    id="notes"
                    rows={4}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    onBlur={saveReviewNotes}
                  />
                </Field>
                {savingNotes && <p className="text-xs text-muted-foreground/70">Saving…</p>}
              </CardContent>
            </Card>

            {feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feedback history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feedback.map((f) => (
                    <div key={f.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                      <div className="text-xs text-muted-foreground/70 mb-1">
                        Revision {f.iterationNumber} · {formatDate(f.createdAt)} · {f.status}
                      </div>
                      <ul className="space-y-1.5">
                        {f.changes.map((c, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium text-foreground">{c.section}:</span>{' '}
                            <span className="text-muted-foreground">{c.description}</span>{' '}
                            <Badge variant="outline">{c.priority}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right — preview + actions */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Preview</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                      <DeviceBtn active={device === 'desktop'} onClick={() => setDevice('desktop')}>
                        <Monitor className="h-3.5 w-3.5" />
                      </DeviceBtn>
                      <DeviceBtn active={device === 'tablet'} onClick={() => setDevice('tablet')}>
                        <Tablet className="h-3.5 w-3.5" />
                      </DeviceBtn>
                      <DeviceBtn active={device === 'mobile'} onClick={() => setDevice('mobile')}>
                        <Smartphone className="h-3.5 w-3.5" />
                      </DeviceBtn>
                    </div>
                    {order.previewUrl && (
                      <a
                        href={order.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:text-primary-hover inline-flex items-center gap-1"
                      >
                        New tab <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border bg-muted/50 p-4 overflow-auto">
                  {order.previewUrl ? (
                    <iframe
                      src={order.previewUrl}
                      title="Site preview"
                      className="bg-background shadow-md mx-auto block"
                      style={{
                        width: DEVICE_WIDTHS[device],
                        height: 700,
                        maxWidth: '100%',
                      }}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground/70">
                      No preview URL yet. Build agent will populate this when the build completes.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  className="flex-1"
                  onClick={() => changeStatus('approved')}
                  disabled={actioning || !order.previewUrl}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve & notify client
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => changeStatus('building')}
                  disabled={actioning}
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> Rebuild
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground/70">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function DeviceBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground/70 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
