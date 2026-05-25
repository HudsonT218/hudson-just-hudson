import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DottedSurface from "./components/DottedSurface.tsx";
import Index from "./pages/Index.tsx";
import WorkPage from "./pages/WorkPage.tsx";
import InterestedPage from "./pages/InterestedPage.tsx";
import AiBriefPage from "./pages/AiBriefPage.tsx";
import ResourcesIndexPage from "./pages/ResourcesIndexPage.tsx";
import AiForSmallBusiness from "./pages/resources/AiForSmallBusiness.tsx";
import WhatCustomAiCosts from "./pages/resources/WhatCustomAiCosts.tsx";
import HireAiHelpOrDoItYourself from "./pages/resources/HireAiHelpOrDoItYourself.tsx";
import WhatSmallBusinessesUseAiFor from "./pages/resources/WhatSmallBusinessesUseAiFor.tsx";
import AiGlossaryForBusinessOwners from "./pages/resources/AiGlossaryForBusinessOwners.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "@/components/configurator/auth/AuthProvider";
import { ProtectedRoute } from "@/components/configurator/layout/ProtectedRoute";
import { AdminRoute } from "@/components/configurator/layout/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
const AdminProjects = lazy(() => import("./pages/admin/Projects.tsx"));
const AdminProjectDetail = lazy(() => import("./pages/admin/ProjectDetail.tsx"));
const AdminReferences = lazy(() => import("./pages/admin/References.tsx"));
const AdminWarmLeads = lazy(() => import("./pages/admin/WarmLeads.tsx"));
const AdminWarmLeadDetail = lazy(() => import("./pages/admin/WarmLeadDetail.tsx"));
const AdminAiVisibility = lazy(() => import("./pages/admin/AiVisibility.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/Settings.tsx"));

const ReferencePage = lazy(() => import("./pages/ReferencePage.tsx"));

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
  <div className="fixed top-3 right-4 z-50 text-xs text-muted-foreground/70 font-light tracking-wide">
    Loading…
  </div>
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

// Fire-and-forget visit logger — writes one row to `traffic_events` per
// public page load. Excludes admin/configurator/auth surfaces.
const VisitLogger = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Import lazily so this work never blocks initial paint, and only the
    // client bundle ever evaluates `supabase.from(...)`.
    void import("@/lib/tracking").then(({ logVisit }) => logVisit(pathname));
  }, [pathname]);
  return null;
};

// Toaster/Sonner use portals (createPortal → document.body) which crash during
// SSR/prerender. Mount them only after the client hydrates.
const ClientOnly = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
};

const AppRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const inConfigurator = isConfiguratorRoute(location.pathname);

  return (
    <>
      <ScrollToTop />
      <VisitLogger />
      {!inConfigurator && <DottedSurface interactive={isHome} />}
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/interested" element={<InterestedPage />} />
          <Route path="/ai-brief" element={<AiBriefPage />} />
          {/* Redirect the previous /ai-test URL (renamed to /ai-brief). */}
          <Route path="/ai-test" element={<Navigate to="/ai-brief" replace />} />
          <Route path="/resources" element={<ResourcesIndexPage />} />
          <Route path="/resources/ai-for-small-business" element={<AiForSmallBusiness />} />
          <Route path="/resources/what-custom-ai-costs" element={<WhatCustomAiCosts />} />
          <Route
            path="/resources/hire-ai-help-or-do-it-yourself"
            element={<HireAiHelpOrDoItYourself />}
          />
          <Route
            path="/resources/what-small-businesses-use-ai-for"
            element={<WhatSmallBusinessesUseAiFor />}
          />
          <Route
            path="/resources/ai-glossary-for-business-owners"
            element={<AiGlossaryForBusinessOwners />}
          />
          {/* 301-style redirects for the older static .html URLs in case anyone
              shared them (the static files used to live in public/resources/). */}
          <Route path="/resources/index.html" element={<Navigate to="/resources" replace />} />
          <Route
            path="/resources/ai-for-small-business.html"
            element={<Navigate to="/resources/ai-for-small-business" replace />}
          />
          <Route path="/packages" element={<Navigate to="/work" replace />} />
          <Route path="/reference/:token" element={<ReferencePage />} />

          {/* Configurator product */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/configure" element={<ConfiguratorPage />} />
          <Route
            path="/configure/:draftId"
            element={
              <ProtectedRoute>
                <ConfiguratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/order/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview/:orderId"
            element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            }
          />

          {/* Lead Management OS */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/leads" element={<AdminRoute><AdminLeads /></AdminRoute>} />
          <Route path="/admin/leads/:id" element={<AdminRoute><AdminLeads /></AdminRoute>} />
          <Route path="/admin/warm-leads" element={<AdminRoute><AdminWarmLeads /></AdminRoute>} />
          <Route path="/admin/warm-leads/:id" element={<AdminRoute><AdminWarmLeadDetail /></AdminRoute>} />
          <Route path="/admin/projects" element={<AdminRoute><AdminProjects /></AdminRoute>} />
          <Route path="/admin/projects/:id" element={<AdminRoute><AdminProjectDetail /></AdminRoute>} />
          <Route path="/admin/references" element={<AdminRoute><AdminReferences /></AdminRoute>} />
          <Route path="/admin/ai-visibility" element={<AdminRoute><AdminAiVisibility /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

// Everything inside the router. Reusable by both the client (BrowserRouter)
// and the server prerender (StaticRouter) entry points.
export const AppContent = () => (
  <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:font-medium focus:shadow-lg"
    >
      Skip to main content
    </a>
    <AppErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AppErrorBoundary>
  </>
);

// All non-router providers. Shared between client and server entries.
// `helmetContext` is required server-side so the prerender script can pull
// out the rendered head tags; on the client it can be omitted.
export const AppProviders = ({
  children,
  helmetContext,
}: {
  children: ReactNode;
  helmetContext?: Record<string, unknown>;
}) => (
  <HelmetProvider context={helmetContext}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ClientOnly>
          <Toaster />
          <Sonner />
        </ClientOnly>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AppProviders>
);

export default App;
