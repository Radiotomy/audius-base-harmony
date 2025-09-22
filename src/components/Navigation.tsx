import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Wallet, Menu, Zap, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WaveformVisualizer from './WaveformVisualizer';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">AB</span>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
              AudioBASE
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">
              Audius × Base
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tracks, artists, playlists..."
              className="pl-10 bg-muted border-border"
            />
          </div>
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