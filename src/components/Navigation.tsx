import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, Zap, LogOut, User } from 'lucide-react';
import audiobaseLogo from '@/assets/audiobase-logo.png';
import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/contexts/PlayerContext';
import { audiusService } from '@/services/audius';
import { useAccount, useBalance } from 'wagmi';
import { useSolana } from '@/contexts/SolanaContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchBar from '@/components/SearchBar';
import { WalletConnectionDialog } from '@/components/WalletConnectionDialog';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const { play } = usePlayer();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Wallet states
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: ethAddress });
  const { connected: isSolConnected } = useSolana();

  const handleTrackSelect = async (track: any) => {
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist: track.user?.name || 'Unknown Artist',
      duration: `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`,
      cover: track.artwork?.['480x480'] || track.artwork?.['150x150'],
      audiusId: track.id,
    };
    await play(transformedTrack, [transformedTrack], true);
  };

  const handleUserSelect = (user: any) => {
    navigate(`/search?q=${encodeURIComponent(user.name)}&type=users`);
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Navigation */}
        {isMobile && <MobileNavigation />}
        
        {/* Logo & Navigation */}
        <div className={`flex items-center ${isMobile ? 'gap-4' : 'gap-8'}`}>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={audiobaseLogo} 
                alt="AudioBASE Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h1 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                  AudioBASE
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  Audius × Base
                </p>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/trending">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Trending
              </Button>
            </Link>
            <Link to="/artists">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Artists
              </Button>
            </Link>
            <Link to="/artist-registration">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Become an Artist
              </Button>
            </Link>
            {user && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Button>
                </Link>
            <Link to="/wallet">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Wallet
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Events
              </Button>
            </Link>
            <Link to="/nft-marketplace">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                NFT Market
              </Button>
            </Link>
            <Link to="/nft-studio">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                NFT Studio
              </Button>
            </Link>
              </>
            )}
          </div>
        </div>

        {/* Search - Hidden on mobile */}
        <div className={`flex-1 max-w-md mx-8 ${isMobile ? 'hidden' : ''}`}>
          <SearchBar 
            onTrackSelect={handleTrackSelect}
            onUserSelect={handleUserSelect}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user && ethBalance && !isMobile && (
            <Button variant="ghost" size="sm">
              <Zap className="h-4 w-4 mr-1" />
              {parseFloat(ethBalance.formatted).toFixed(3)} {ethBalance.symbol}
            </Button>
          )}
          
          {user ? (
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
              {!isMobile && (
                <WalletConnectionDialog>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={`gradient-accent border-accent text-accent-foreground hover:scale-105 transition-bounce ${
                      (isEthConnected || isSolConnected) ? 'bg-accent/20' : ''
                    }`}
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    {isEthConnected || isSolConnected ? 'Wallet Connected' : 'Connect Wallet'}
                  </Button>
                </WalletConnectionDialog>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    {!isMobile && 'Profile'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild variant="outline" size={isMobile ? "sm" : "sm"}>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;