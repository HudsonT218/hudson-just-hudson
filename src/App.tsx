import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DottedSurface from "./components/DottedSurface.tsx";
import ChatWidget from "./components/ChatWidget";
import Index from "./pages/Index.tsx";
import Packages from "./pages/Packages.tsx";
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

const CONFIGURATOR_PREFIXES = ["/configure", "/dashboard", "/preview", "/admin"];

const AppRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isConfigurator = CONFIGURATOR_PREFIXES.some((p) => location.pathname.startsWith(p));

  return (
    <>
      {!isConfigurator && <DottedSurface interactive={isHome} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/packages" element={<Packages />} />

        {/* Configurator product (auth + wizard + dashboards) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/configure"
          element={
            <ProtectedRoute>
              <ConfiguratorPage />
            </ProtectedRoute>
          }
        />
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
        <style>{`
          @keyframes saleBannerGlow {
            0%, 100% {
              box-shadow: 0 2px 12px rgba(239,68,68,0.35), 0 0 28px rgba(249,115,22,0.2);
            }
            50% {
              box-shadow: 0 2px 20px rgba(239,68,68,0.6), 0 0 44px rgba(249,115,22,0.4);
            }
          }
        `}</style>
        <Toaster />
        <Sonner />
        <ChatWidget />
        <BrowserRouter>
          <AuthProvider>
          <Link
            to="/packages"
            className="fixed top-0 left-0 right-0 z-[60] py-2 px-4 text-center block cursor-pointer hover:brightness-110 transition-all"
            style={{
              background:
                "linear-gradient(90deg, #dc2626 0%, #f97316 50%, #dc2626 100%)",
              animation: "saleBannerGlow 2.5s ease-in-out infinite",
            }}
          >
            <p
              className="inline-flex items-center gap-2 text-xs font-semibold text-white"
              style={{
                letterSpacing: "0.05em",
                textShadow: "0 1px 2px rgba(0,0,0,0.25)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              Launch Sale — 50% off all website packages. First 5 clients only.
            </p>
          </Link>
          <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
