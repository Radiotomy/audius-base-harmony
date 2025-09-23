import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Users, Music, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ArtistCard from '@/components/ArtistCard';
import TipArtistDialog from '@/components/TipArtistDialog';
import { useAudiusTrendingTracks, useAudiusSearch } from '@/hooks/useAudius';
import { Link } from 'react-router-dom';

const Artists = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [showTipDialog, setShowTipDialog] = useState(false);
  
  // Fetch trending tracks to extract artists
  const { tracks: trendingTracks, loading: tracksLoading } = useAudiusTrendingTracks(50);
  const { results: searchResults, loading: searchLoading, search } = useAudiusSearch();

  // Extract unique artists from trending tracks
  const featuredArtists = useMemo(() => {
    const artistMap = new Map();
    
    trendingTracks.forEach(track => {
      if (!artistMap.has(track.user.id)) {
        // Type assertion to access full user properties that might exist in the actual API response
        const user = track.user as any;
        artistMap.set(track.user.id, {
          id: track.user.id,
          name: track.user.name,
          handle: track.user.handle,
          followers: user.follower_count?.toLocaleString() || '0',
          avatar: track.user.profile_picture?.['150x150'] || track.user.profile_picture?.['480x480'],
          genre: track.genre || 'Various',
          topTrack: track.title,
          trackCount: user.track_count || 0,
          isVerified: user.is_verified || false,
          bio: user.bio || null,
          location: user.location || null
        });
      }
    });
    
    return Array.from(artistMap.values());
  }, [trendingTracks]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await search(query, 'users');
    }
  };

  const handleTrackPlay = (track: any) => {
    console.log('Playing track:', track);
    // This would integrate with the audio player
  };

  const handleArtistTip = (artist: any) => {
    setSelectedArtist(artist);
    setShowTipDialog(true);
  };

  const displayedArtists = searchQuery.trim() ? searchResults.users : featuredArtists;
  const isLoading = searchQuery.trim() ? searchLoading : tracksLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="gradient-accent px-4 py-2 text-sm font-medium mb-4">
              <Users className="h-4 w-4 mr-2" />
              Artist Discovery
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Discover <span className="gradient-primary bg-clip-text text-transparent">Artists</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore talented musicians and creators on the Audius platform
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for artists..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10 pr-4 py-3 text-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Featured Artists'}
            </h2>
            <div className="text-sm text-muted-foreground">
              {displayedArtists?.length || 0} artists found
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeletons
              [...Array(12)].map((_, index) => (
                <Card key={index} className="p-6 shadow-card bg-card">
                  <div className="text-center space-y-4">
                    <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                      <Skeleton className="h-3 w-1/2 mx-auto" />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </Card>
              ))
            ) : displayedArtists?.length > 0 ? (
              displayedArtists.map((artist) => (
                <Card key={artist.id} className="p-6 shadow-card bg-card hover:shadow-glow transition-smooth group">
                  <div className="text-center space-y-4">
                    {/* Artist Avatar */}
                    <div className="relative mx-auto">
                      {artist.avatar ? (
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto border-2 border-border"><div class="text-2xl">👤</div></div>';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto border-2 border-border">
                          <div className="text-2xl">👤</div>
                        </div>
                      )}
                      {artist.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground">✓</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Artist Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-smooth">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{artist.handle}
                      </p>
                      {artist.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {artist.location}
                        </p>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{artist.followers}</div>
                        <div className="text-muted-foreground text-xs">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{artist.trackCount}</div>
                        <div className="text-muted-foreground text-xs">Tracks</div>
                      </div>
                    </div>
                    
                    {/* Genre */}
                    <Badge variant="secondary" className="text-xs">
                      {artist.genre}
                    </Badge>
                    
                    {/* Actions */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTrackPlay({ 
                          id: artist.id, 
                          title: artist.topTrack, 
                          user: { name: artist.name } 
                        })}
                      >
                        <Music className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                      <Button
                        size="sm"
                        className="gradient-primary"
                        onClick={() => handleArtistTip(artist)}
                      >
                        💎 Tip
                      </Button>
                    </div>
                    
                    {/* Bio Preview */}
                    {artist.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {artist.bio}
                      </p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery.trim() ? 'No artists found' : 'No artists available'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery.trim() 
                    ? 'Try adjusting your search terms' 
                    : 'Artists will appear here once tracks are loaded'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tip Artist Dialog */}
      <TipArtistDialog
        open={showTipDialog}
        onOpenChange={setShowTipDialog}
        artist={selectedArtist || { id: '', name: '' }}
      />
    </div>
  );
};

export default Artists;