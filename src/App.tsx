import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import SuccessBanner from "@/components/SuccessBanner";
import Index from "./pages/Index";
import Prospects from "./pages/Prospects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { showLoginSuccessBanner, setShowLoginSuccessBanner, user } = useAuth();

  return (
    <>
      <SuccessBanner
        message={`Welcome back, ${user?.user_metadata?.name || user?.email}! LinkedIn authentication successful.`}
        isVisible={showLoginSuccessBanner}
        onDismiss={() => setShowLoginSuccessBanner(false)}
      />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/prospects" element={<Prospects />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
