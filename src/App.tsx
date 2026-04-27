import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DottedSurface from "./components/DottedSurface.tsx";
import ChatWidget from "./components/ChatWidget";
import Index from "./pages/Index.tsx";
import Packages from "./pages/Packages.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <DottedSurface interactive={isHome} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/packages" element={<Packages />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
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
      <div
        className="fixed top-0 left-0 right-0 z-[60] py-2 px-4 text-center"
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
      </div>
      <Toaster />
      <Sonner />
      <ChatWidget />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
