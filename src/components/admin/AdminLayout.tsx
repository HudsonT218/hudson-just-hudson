import { useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Flame,
  Users,
  FolderKanban,
  BookOpen,
  Target,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/configurator/auth/AuthProvider";
import { admin } from "@/pages/admin/_components/theme";

// Warm sibling admin chunks so tab switching never hits the suspense fallback.
const preloadAdminChunks = () => {
  void import("@/pages/admin/Dashboard");
  void import("@/pages/admin/Leads");
  void import("@/pages/admin/Projects");
  void import("@/pages/admin/ProjectDetail");
  void import("@/pages/admin/References");
  void import("@/pages/admin/WarmLeads");
  void import("@/pages/admin/WarmLeadDetail");
};

const NAV: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Warm Leads", to: "/admin/warm-leads", icon: Flame },
  { label: "Leads", to: "/admin/leads", icon: Users },
  { label: "Projects", to: "/admin/projects", icon: FolderKanban },
  { label: "References", to: "/admin/references", icon: BookOpen },
];

function isActive(currentPath: string, target: string): boolean {
  if (target === "/admin") return currentPath === "/admin";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name && name.trim()) || email || "";
  if (!source) return "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return source.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    preloadAdminChunks();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const initials = getInitials(profile?.fullName, user?.email);
  const emailDisplay = user?.email ?? "Not signed in";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: admin.bg }}>
      <aside
        className="w-[220px] shrink-0 flex flex-col fixed inset-y-0 left-0"
        style={{
          backgroundColor: admin.surface,
          borderRight: `1px solid ${admin.border}`,
        }}
      >
        {/* Brand block */}
        <div className="px-5 pt-5 pb-6">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
              }}
            >
              <Target size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="font-semibold"
                style={{
                  color: admin.text,
                  fontSize: 16,
                  letterSpacing: "-0.02em",
                }}
              >
                Lead OS
              </span>
              <span
                style={{
                  color: admin.textDim,
                  fontSize: 11,
                  letterSpacing: "0.04em",
                }}
              >
                v1 · admin
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(location.pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor: active ? admin.accentSoft : "transparent",
                  color: active ? admin.text : admin.textMuted,
                  fontWeight: active ? 500 : 400,
                }}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 bottom-1.5 rounded-full"
                    style={{ width: 3, backgroundColor: admin.accent }}
                  />
                )}
                <Icon size={16} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Account block */}
        <div className="p-3">
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{
              backgroundColor: admin.surface2,
              border: `1px solid ${admin.border}`,
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex items-center justify-center shrink-0 rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                {initials}
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span
                  className="truncate"
                  style={{ color: admin.text, fontSize: 12, fontWeight: 500 }}
                  title={emailDisplay}
                >
                  {emailDisplay}
                </span>
                <span style={{ color: admin.textDim, fontSize: 10 }}>settings</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors hover:[background-color:rgba(255,255,255,0.04)]"
              style={{ color: admin.textMuted }}
            >
              <LogOut size={13} strokeWidth={2} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-[220px] min-h-screen overflow-x-hidden relative">
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 280,
            background:
              "radial-gradient(ellipse 75% 100% at 50% 0%, rgba(59,130,246,0.14), transparent 72%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          aria-hidden
          className="sticky top-0 left-0 right-0 z-10"
          style={{ pointerEvents: "none", height: 0 }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.65) 50%, transparent 100%)",
            }}
          />
        </div>
        <div className="relative z-[1]">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
