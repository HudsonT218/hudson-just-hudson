import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '@/components/configurator/auth/AuthProvider';
import { Button } from '@/components/configurator/ui/loading-button';
import { getOrder } from '@/lib/configurator-db';
import type { Order } from '@/lib/configurator-types';

export default function PreviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { profile } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    getOrder(orderId).then((o) => {
      if (cancelled) return;
      setOrder(o);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading preview…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground">Preview not found.</p>
          <Link to="/dashboard">
            <Button variant="outline" className="mt-3">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Anyone with a non-admin account who isn't the owner shouldn't see the preview.
  if (!profile?.isAdmin && profile?.id !== order.userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">You don&apos;t have access to this preview.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container-page flex items-center justify-between py-3">
          <Link
            to={`/dashboard/order/${order.id}`}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to order
          </Link>
          <div className="text-xs font-mono text-muted-foreground/70">{order.orderNumber}</div>
          {order.previewUrl && (
            <a
              href={order.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:text-primary-hover inline-flex items-center gap-1"
            >
              Open in new tab <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </header>
      <div className="flex-1">
        {order.previewUrl ? (
          <iframe src={order.previewUrl} title="Preview" className="w-full h-full min-h-[calc(100vh-58px)] bg-background" />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-58px)] text-muted-foreground">
            No preview URL yet — your build is still in progress.
          </div>
        )}
      </div>
    </div>
  );
}
