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
      <div
        className="fixed top-0 left-0 right-0 z-[60] py-2 px-4 text-center"
        style={{
          backgroundColor: "rgba(59,130,246,0.15)",
          borderBottom: "1px solid rgba(59,130,246,0.25)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <p
          className="text-xs font-medium text-white"
          style={{ letterSpacing: "0.02em" }}
        >
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
