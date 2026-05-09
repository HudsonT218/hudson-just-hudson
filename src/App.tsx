import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { AuthProvider } from "@/components/configurator/auth/AuthProvider";
import { ProtectedRoute } from "@/components/configurator/layout/ProtectedRoute";
import { AdminRoute } from "@/components/configurator/layout/AdminRoute";
import LoginPage from "./pages/configurator/LoginPage.tsx";
import SignupPage from "./pages/configurator/SignupPage.tsx";
import ConfiguratorPage from "./pages/configurator/ConfiguratorPage.tsx";
import DashboardPage from "./pages/configurator/DashboardPage.tsx";
import OrderDetailPage from "./pages/configurator/OrderDetailPage.tsx";
import PreviewPage from "./pages/configurator/PreviewPage.tsx";
import AdminPage from "./pages/configurator/AdminPage.tsx";
import AdminOrderDetailPage from "./pages/configurator/AdminOrderDetailPage.tsx";

const queryClient = new QueryClient();

// Configurator routes — DottedSurface is hidden on these.
// Login/signup also count.
const CONFIGURATOR_PREFIXES = [
  "/configure",
  "/dashboard",
  "/preview",
  "/admin",
  "/login",
  "/signup",
];

function isConfiguratorRoute(pathname: string): boolean {
  return CONFIGURATOR_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const AppRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const inConfigurator = isConfiguratorRoute(location.pathname);

  return (
    <>
      {!inConfigurator && <DottedSurface interactive={isHome} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/interested" element={<InterestedPage />} />
        <Route path="/packages" element={<Navigate to="/work" replace />} />

        {/* Configurator product */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* /configure is OPEN — Steps 1-3 don't require auth.
            Step 4 (Content) and beyond gate themselves via the wizard. */}
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
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/order/:orderId"
          element={
            <AdminRoute>
              <AdminOrderDetailPage />
            </AdminRoute>
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
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
