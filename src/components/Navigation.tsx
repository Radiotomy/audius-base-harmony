import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, Zap, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/contexts/PlayerContext';
import { audiusService } from '@/services/audius';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchBar from '@/components/SearchBar';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const { play } = usePlayer();
  const navigate = useNavigate();

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
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Link to="/">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">AB</span>
              </div>
            </Link>
            <div>
              <Link to="/">
                <h1 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                  AudioBASE
                </h1>
              </Link>
              <p className="text-xs text-muted-foreground -mt-1">
                Audius × Base
              </p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
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
            {user && (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <SearchBar 
            onTrackSelect={handleTrackSelect}
            onUserSelect={handleUserSelect}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <Button variant="ghost" size="sm">
              <Zap className="h-4 w-4 mr-1" />
              0.5 ETH
            </Button>
          )}
          
          {user ? (
            <>
              <Button 
                variant="outline"
                size="sm"
                className="gradient-accent border-accent text-accent-foreground hover:scale-105 transition-bounce"
              >
                <Wallet className="h-4 w-4 mr-1" />
                Connect
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    Profile
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
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
          
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;