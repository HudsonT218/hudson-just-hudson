import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { label: "Dashboard", to: "/admin" },
  { label: "Leads", to: "/admin/leads" },
  { label: "Projects", to: "/admin/projects" },
  { label: "References", to: "/admin/references" },
];

function isActive(currentPath: string, target: string): boolean {
  if (target === "/admin") return currentPath === "/admin";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#09090b" }}>
      <aside
        className="w-[220px] shrink-0 flex flex-col fixed inset-y-0 left-0"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="px-6 pt-6 pb-8">
          <Link
            to="/admin"
            className="text-xl font-extrabold text-white tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            HT <span className="text-gray-500 font-normal text-xs ml-1">admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-3">
          {NAV.map((item) => {
            const active = isActive(location.pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="block px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor: active ? "rgba(255,255,255,0.06)" : "transparent",
                  color: active ? "#fff" : "rgb(156,163,175)",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[220px] min-h-screen">{children}</main>
    </div>
  );
}

export default AdminLayout;
