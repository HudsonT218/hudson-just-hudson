import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DottedSurface from "./components/DottedSurface.tsx";
import Index from "./pages/Index.tsx";
import WorkPage from "./pages/WorkPage.tsx";
import InterestedPage from "./pages/InterestedPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AuthProvider = lazy(() =>
  import("@/components/configurator/auth/AuthProvider").then((module) => ({
    default: module.AuthProvider,
  })),
);
const ProtectedRoute = lazy(() =>
  import("@/components/configurator/layout/ProtectedRoute").then((module) => ({
    default: module.ProtectedRoute,
  })),
);
const AdminRoute = lazy(() =>
  import("@/components/configurator/layout/AdminRoute").then((module) => ({
    default: module.AdminRoute,
  })),
);
const LoginPage = lazy(() => import("./pages/configurator/LoginPage.tsx"));
const SignupPage = lazy(() => import("./pages/configurator/SignupPage.tsx"));
const ForgotPasswordPage = lazy(() => import("./pages/configurator/ForgotPasswordPage.tsx"));
const ResetPasswordPage = lazy(() => import("./pages/configurator/ResetPasswordPage.tsx"));
const ConfiguratorPage = lazy(() => import("./pages/configurator/ConfiguratorPage.tsx"));
const DashboardPage = lazy(() => import("./pages/configurator/DashboardPage.tsx"));
const OrderDetailPage = lazy(() => import("./pages/configurator/OrderDetailPage.tsx"));
const PreviewPage = lazy(() => import("./pages/configurator/PreviewPage.tsx"));

// Lead Management OS — Hudson's personal CRM
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const AdminLeads = lazy(() => import("./pages/admin/Leads.tsx"));
const AdminLeadDetail = lazy(() => import("./pages/admin/LeadDetail.tsx"));
const AdminProjects = lazy(() => import("./pages/admin/Projects.tsx"));
const AdminProjectDetail = lazy(() => import("./pages/admin/ProjectDetail.tsx"));

// Configurator routes — DottedSurface is hidden on these.
// Login/signup also count.
const CONFIGURATOR_PREFIXES = [
  "/configure",
  "/dashboard",
  "/preview",
  "/admin",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isConfiguratorRoute(pathname: string): boolean {
  return CONFIGURATOR_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const PageFallback = () => (
  <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center">
    Loading…
  </div>
);

const ConfiguratorBoundary = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageFallback />}>
    <AuthProvider>{children}</AuthProvider>
  </Suspense>
);

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App render failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold">Something didn&apos;t load.</h1>
            <p className="mt-3 text-sm text-muted-foreground">Refresh the page to try again.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const AppRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const inConfigurator = isConfiguratorRoute(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!inConfigurator && <DottedSurface interactive={isHome} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/interested" element={<InterestedPage />} />
        <Route path="/packages" element={<Navigate to="/work" replace />} />

        {/* Configurator product */}
        <Route path="/login" element={<ConfiguratorBoundary><LoginPage /></ConfiguratorBoundary>} />
        <Route path="/signup" element={<ConfiguratorBoundary><SignupPage /></ConfiguratorBoundary>} />
        <Route path="/forgot-password" element={<ConfiguratorBoundary><ForgotPasswordPage /></ConfiguratorBoundary>} />
        <Route path="/reset-password" element={<ConfiguratorBoundary><ResetPasswordPage /></ConfiguratorBoundary>} />

        {/* /configure is OPEN — Steps 1-3 don't require auth.
            Step 4 (Content) and beyond gate themselves via the wizard. */}
        <Route path="/configure" element={<ConfiguratorBoundary><ConfiguratorPage /></ConfiguratorBoundary>} />
        <Route
          path="/configure/:draftId"
          element={
            <ConfiguratorBoundary>
              <ProtectedRoute>
                <ConfiguratorPage />
              </ProtectedRoute>
            </ConfiguratorBoundary>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ConfiguratorBoundary>
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </ConfiguratorBoundary>
          }
        />
        <Route
          path="/dashboard/order/:orderId"
          element={
            <ConfiguratorBoundary>
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            </ConfiguratorBoundary>
          }
        />
        <Route
          path="/preview/:orderId"
          element={
            <ConfiguratorBoundary>
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            </ConfiguratorBoundary>
          }
        />

        {/* Lead Management OS */}
        <Route
          path="/admin"
          element={
            <ConfiguratorBoundary>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ConfiguratorBoundary>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <ConfiguratorBoundary>
              <AdminRoute>
                <AdminLeads />
              </AdminRoute>
            </ConfiguratorBoundary>
          }
        />
        <Route
          path="/admin/leads/:id"
          element={
            <ConfiguratorBoundary>
              <AdminRoute>
                <AdminLeadDetail />
              </AdminRoute>
            </ConfiguratorBoundary>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ConfiguratorBoundary>
              <AdminRoute>
                <AdminProjects />
              </AdminRoute>
            </ConfiguratorBoundary>
          }
        />
        <Route
          path="/admin/projects/:id"
          element={
            <ConfiguratorBoundary>
              <AdminRoute>
                <AdminProjectDetail />
              </AdminRoute>
            </ConfiguratorBoundary>
          }
        />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppErrorBoundary>
            <AppRoutes />
          </AppErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
