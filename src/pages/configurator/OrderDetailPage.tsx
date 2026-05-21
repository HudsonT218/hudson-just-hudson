import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import { FeedbackForm } from '@/components/configurator/dashboard/FeedbackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getOrder, getFeedbackForOrder } from '@/lib/configurator-db';
import type { Order, Feedback } from '@/lib/configurator-types';
import { MODEL_DEFINITIONS, THEME_DEFINITIONS, SECTION_TYPE_DEFINITIONS, STATUS_LABELS } from '@/lib/configurator-constants';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getOrder(orderId), getFeedbackForOrder(orderId)]).then(([o, f]) => {
      if (cancelled) return;
      setOrder(o);
      setFeedback(f);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function refreshOrder() {
    if (!orderId) return;
    const [o, f] = await Promise.all([getOrder(orderId), getFeedbackForOrder(orderId)]);
    setOrder(o);
    setFeedback(f);
  }

  if (loading) {
    return (
      <PageShell>
        <p className="text-muted-foreground">Loading order…</p>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell>
        <Card className="p-6">
          <p className="text-foreground">Order not found.</p>
          <Link to="/dashboard">
            <Button variant="outline" className="mt-3">
              Back to dashboard
            </Button>
          </Link>
        </Card>
      </PageShell>
    );
  }

  const model = MODEL_DEFINITIONS.find((m) => m.id === order.spec.model);
  const theme = THEME_DEFINITIONS.find((t) => t.id === order.spec.theme);
  const status = STATUS_LABELS[order.status];

  const showPreview = order.previewUrl && (order.status === 'review' || order.status === 'approved' || order.status === 'delivered' || order.status === 'revision_requested');
  const canFeedback = (order.status === 'approved' || order.status === 'delivered' || order.status === 'review') && order.iterationCount < order.maxIterations;

  return (
    <PageShell title={`Order ${order.orderNumber}`}>
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left, info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="font-mono text-xs text-muted-foreground/70">{order.orderNumber}</div>
              <div className="flex items-center justify-between mt-2">
                <CardTitle className="text-xl">{model?.name}</CardTitle>
                <Badge>{status?.label ?? order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Theme" value={theme?.name ?? '-'} />
              <Row label="Sections" value={`${order.spec.sections.length}`} />
              <Row label="Amount" value={order.amountPaid != null ? formatCurrency(order.amountPaid) : '-'} />
              <Row label="Ordered" value={formatDate(order.createdAt)} />
              {order.buildStartedAt && <Row label="Build started" value={formatDate(order.buildStartedAt)} />}
              {order.buildCompletedAt && <Row label="Build done" value={formatDate(order.buildCompletedAt)} />}
              <Row label="Iterations used" value={`${order.iterationCount} / ${order.maxIterations}`} />
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
                          <span className="text-muted-foreground">{c.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right, preview + feedback */}
        <div className="lg:col-span-2 space-y-4">
          {showPreview ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Preview</CardTitle>
                  <a
                    href={order.previewUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:text-primary-hover inline-flex items-center gap-1"
                  >
                    Open in new tab <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border overflow-hidden bg-muted/50">
                  <iframe
                    src={order.previewUrl ?? undefined}
                    title="Site preview"
                    className="w-full h-[600px] bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-foreground font-medium">
                {order.status === 'paid' && 'Your build is queued. We’ll start shortly.'}
                {order.status === 'building' && 'We’re building your site right now.'}
                {order.status === 'revision_requested' && 'Working on your revisions.'}
                {!['paid', 'building', 'revision_requested'].includes(order.status) && 'No preview available yet.'}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                You&apos;ll get an email the moment your preview is ready.
              </p>
            </Card>
          )}

          {canFeedback && user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request a revision</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackForm order={order} userId={user.id} onSubmitted={refreshOrder} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <>
      <Helmet>
        <title>{title ? `${title} · Hudson Turansky` : "Order · Hudson Turansky"}</title>
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</div>
      </main>
    </>
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
