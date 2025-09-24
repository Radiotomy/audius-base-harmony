import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OnchainProvider } from "@/contexts/OnchainKitProvider";
import { SolanaProvider } from "@/contexts/SolanaContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import ContractDashboard from "./pages/ContractDashboard";
import { ArtistEarnings } from "./pages/ArtistEarnings";
import NFTMarketplace from "./pages/NFTMarketplace";
import NFTStudio from "./pages/NFTStudio";
import { Events } from './pages/Events';
import { CreateEvent } from './pages/CreateEvent';
import ArtistDashboard from "./pages/ArtistDashboard";
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
                      <Route path="/search" element={<SearchResults />} />
                      
                      {/* Protected Routes */}
                      <Route path="/artist-registration" element={
                        <ProtectedRoute>
                          <ArtistRegistration />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/profile" element={
                        <ProtectedRoute>
                          <DashboardProfile />
                        </ProtectedRoute>
                      } />
                      <Route path="/wallet" element={
                        <ProtectedRoute>
                          <WalletDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/contracts" element={
                        <ProtectedRoute>
                          <ContractDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/artist-earnings" element={
                        <ProtectedRoute>
                          <ArtistEarnings />
                        </ProtectedRoute>
                      } />
                      <Route path="/artist-dashboard" element={
                        <ProtectedRoute requireArtist>
                          <ArtistDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/create" element={
                        <ProtectedRoute requireArtist>
                          <CreateEvent />
                        </ProtectedRoute>
                      } />
                      <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                      <Route path="/nft-studio" element={
                        <ProtectedRoute>
                          <NFTStudio />
                        </ProtectedRoute>
                      } />
                      
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
