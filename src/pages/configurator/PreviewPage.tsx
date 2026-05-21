import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/configurator/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/configurator-db";
import type { Order } from "@/lib/configurator-types";

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
      <>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">
          Loading preview…
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-foreground">Preview not found.</p>
            <Link to="/dashboard">
              <Button variant="outline" className="mt-3">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!profile?.isAdmin && profile?.id !== order.userId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">
            You don&apos;t have access to this preview.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Preview {order.orderNumber} · Hudson Turansky</title>
      </Helmet>
      <Navbar />
      <div className="min-h-screen pt-16 flex flex-col">
        <header className="sticky top-16 z-30 border-b border-white/5 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
            <Link
              to={`/dashboard/order/${order.id}`}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to order
            </Link>
            <div className="text-xs font-mono text-muted-foreground">{order.orderNumber}</div>
            {order.previewUrl ? (
              <a
                href={order.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1"
              >
                Open in new tab <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="text-sm text-muted-foreground/60">No preview yet</span>
            )}
          </div>
        </header>
        <div className="flex-1">
          {order.previewUrl ? (
            <iframe
              src={order.previewUrl}
              title="Preview"
              className="w-full min-h-[calc(100vh-8rem)] bg-background"
            />
          ) : (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">
              No preview URL yet, your build is still in progress.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
