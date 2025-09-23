import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OnchainProvider } from "@/contexts/OnchainKitProvider";
import { SolanaProvider } from "@/contexts/SolanaContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Trending from "./pages/Trending";
import Artists from "./pages/Artists";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <OnchainProvider>
      <SolanaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/artists" element={<Artists />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SolanaProvider>
    </OnchainProvider>
  </AuthProvider>
);

export default App;
