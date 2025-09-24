import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Home, TrendingUp, Users, Briefcase, Wallet, ShoppingBag, Palette } from 'lucide-react';
import audiobaseLogo from '@/assets/audiobase-logo.png';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/trending', icon: TrendingUp, label: 'Trending' },
    { to: '/artists', icon: Users, label: 'Artists' },
    { to: '/artist-registration', icon: Briefcase, label: 'Become an Artist' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/nft-marketplace', icon: ShoppingBag, label: 'NFT Market' },
    { to: '/nft-studio', icon: Palette, label: 'NFT Studio' }
  ];

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img 
                    src={audiobaseLogo} 
                    alt="AudioBASE Logo" 
                    className="h-8 w-8 rounded-lg"
                  />
                  <span className="font-bold text-lg">AudioBASE</span>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tracks, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10"
                />
              </form>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.user_metadata?.username || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <SheetClose asChild>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                    </SheetClose>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={signOut}
                      className="flex-1"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </SheetClose>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;