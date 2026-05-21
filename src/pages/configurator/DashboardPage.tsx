import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Plus, FileText, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/configurator/auth/AuthProvider";
import { OrderCard } from "@/components/configurator/dashboard/OrderCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getOrders, getDrafts, deleteDraft } from "@/lib/configurator-db";
import type { Order, Draft } from "@/lib/configurator-types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();
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
    <>
      <Helmet>
        <title>Dashboard · Hudson Turansky</title>
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                Your work
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5">
                Pick up where you left off, or start a new build.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {profile?.isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {profile?.fullName ?? profile?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
              <Link to="/configure">
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> New build
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-12">
              {drafts.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
                    In progress
                  </h2>
                  <div className="space-y-3">
                    {drafts.map((d) => (
                      <Card
                        key={d.id}
                        className="p-5 flex items-center justify-between bg-card/40 backdrop-blur-sm hover:border-white/15 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">{d.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {d.model ?? "No model yet"} · Step {d.currentStep} · last edited{" "}
                              {formatDate(d.updatedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/configure/${d.id}`}>
                            <Button size="sm" variant="outline">
                              Resume
                            </Button>
                          </Link>
                          <button
                            onClick={() => void onDeleteDraft(d.id)}
                            className="p-2 text-muted-foreground hover:text-destructive rounded-md transition-colors"
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

              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
                  Orders
                </h2>
                {orders.length === 0 ? (
                  <Card className="p-12 text-center bg-card/40 backdrop-blur-sm">
                    <p className="text-muted-foreground">You don&apos;t have any orders yet.</p>
                    <Link to="/configure" className="inline-block mt-4">
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
        </div>
      </main>
    </>
  );
}
