import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAudiusSearch } from '@/hooks/useAudius';
import { Search, Filter, Clock, TrendingUp, Music, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilters {
  type: 'all' | 'tracks' | 'users';
  genre?: string;
  duration?: 'short' | 'medium' | 'long';
  sortBy?: 'relevance' | 'plays' | 'recent';
}

interface SearchBarProps {
  onTrackSelect?: (track: any) => void;
  onUserSelect?: (user: any) => void;
  className?: string;
}

const GENRES = [
  'Electronic', 'Hip Hop', 'Pop', 'Rock', 'Jazz', 'Classical', 
  'R&B', 'Country', 'Folk', 'Reggae', 'Latin', 'World'
];

const SearchBar: React.FC<SearchBarProps> = ({ 
  onTrackSelect, 
  onUserSelect, 
  className 
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { results, loading, search } = useAudiusSearch();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('audiobase-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('audiobase-recent-searches', JSON.stringify(updated));
  };

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    saveSearch(query);
    await search(query, filters.type);
    setShowResults(true);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrackClick = (track: any) => {
    onTrackSelect?.(track);
    setShowResults(false);
    setQuery('');
  };

  const handleUserClick = (user: any) => {
    onUserSelect?.(user);
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowResults(query.length > 0 || recentSearches.length > 0)}
          placeholder="Search tracks, artists, or playlists..."
          className="pl-10 pr-20 h-12 text-base"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", showFilters && "bg-accent")}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSearch}
            variant="default"
            size="sm"
            disabled={!query.trim() || loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="absolute top-14 left-0 right-0 p-4 shadow-lg z-50 bg-card/95 backdrop-blur-md">
          <div className="space-y-4">
            {/* Content Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <div className="flex gap-2">
                {(['all', 'tracks', 'users'] as const).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setFilters(prev => ({ ...prev, type }))}
                    variant={filters.type === type ? "default" : "outline"}
                    size="sm"
                    className="capitalize"
                  >
                    {type === 'all' ? 'All' : type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <div className="flex flex-wrap gap-1">
                <Button
                  onClick={() => setFilters(prev => ({ ...prev, genre: undefined }))}
                  variant={!filters.genre ? "default" : "outline"}
                  size="sm"
                >
                  All Genres
                </Button>
                {GENRES.map((genre) => (
                  <Button
                    key={genre}
                    onClick={() => setFilters(prev => ({ ...prev, genre }))}
                    variant={filters.genre === genre ? "default" : "outline"}
                    size="sm"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <div className="flex gap-2">
                {[
                  { key: undefined, label: 'Any Length' },
                  { key: 'short' as const, label: '< 3 min' },
                  { key: 'medium' as const, label: '3-6 min' },
                  { key: 'long' as const, label: '> 6 min' },
                ].map(({ key, label }) => (
                  <Button
                    key={key || 'any'}
                    onClick={() => setFilters(prev => ({ ...prev, duration: key }))}
                    variant={filters.duration === key ? "default" : "outline"}
                    size="sm"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-14 left-0 right-0 max-h-96 overflow-y-auto shadow-lg z-40 bg-card/95 backdrop-blur-md">
          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setQuery(search);
                      handleSearch();
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {/* Results */}
          {!loading && (results.tracks.length > 0 || results.users.length > 0) && (
            <div className="p-2">
              {/* Tracks */}
              {results.tracks.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tracks</span>
                  </div>
                  {results.tracks.slice(0, 5).map((track) => (
                    <div
                      key={track.id}
                      onClick={() => handleTrackClick(track)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                    >
                      {track.artwork?.['150x150'] && (
                        <img
                          src={track.artwork['150x150']}
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.user?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {track.play_count?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Users/Artists */}
              {results.users.length > 0 && (
                <div>
                  <Separator className="mb-2" />
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Artists</span>
                  </div>
                  {results.users.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                    >
                      {user.profile_picture?.['150x150'] && (
                        <img
                          src={user.profile_picture['150x150']}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.follower_count?.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && query.length > 0 && results.tracks.length === 0 && results.users.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SearchBar;