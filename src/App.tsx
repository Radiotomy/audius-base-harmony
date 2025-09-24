import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OnchainProvider } from "@/contexts/OnchainKitProvider";
import { SolanaProvider } from "@/contexts/SolanaContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navigation from "@/components/Navigation";
import MobileAudioPlayer from "@/components/MobileAudioPlayer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Trending from "./pages/Trending";
import Artists from "./pages/Artists";
import SearchResults from "./pages/SearchResults";
import ArtistProfile from "./pages/ArtistProfile";
import Dashboard from "./pages/Dashboard";
import DashboardProfile from "./pages/DashboardProfile";
import { ArtistRegistration } from "./pages/ArtistRegistration";
import WalletDashboard from "./pages/WalletDashboard";
import { ArtistEarnings } from "./pages/ArtistEarnings";
import NFTMarketplace from "./pages/NFTMarketplace";
import NFTStudio from "./pages/NFTStudio";
import NotFound from "./pages/NotFound";

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <OnchainProvider>
        <SolanaProvider>
          <PlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <Navigation />
                  <main className="pb-20 lg:pb-8">
                    <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/artist/:artistId" element={<ArtistProfile />} />
                  <Route path="/artist-registration" element={<ArtistRegistration />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/profile" element={<DashboardProfile />} />
                  <Route path="/wallet" element={<WalletDashboard />} />
                  <Route path="/artist-earnings" element={<ArtistEarnings />} />
                  <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                  <Route path="/nft-studio" element={<NFTStudio />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <MobileAudioPlayer />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </PlayerProvider>
        </SolanaProvider>
      </OnchainProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
