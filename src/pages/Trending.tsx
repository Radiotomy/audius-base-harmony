import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, ArrowLeft, Plus, Clock, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AudioPlayer from '@/components/AudioPlayer';
import FavoriteButton from '@/components/FavoriteButton';
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog';
import { useAudiusTrendingTracks } from '@/hooks/useAudius';
import { Link } from 'react-router-dom';

const Trending = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  
  // Fetch more trending tracks
  const { tracks: trendingTracks, loading: tracksLoading } = useAudiusTrendingTracks(20);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getArtworkUrl = (artwork: any) => {
    if (!artwork) return null;
    
    if (typeof artwork === 'string') return artwork;
    if (artwork['480x480']) return artwork['480x480'];
    if (artwork['150x150']) return artwork['150x150'];
    if (artwork.large) return artwork.large;
    if (artwork.small) return artwork.small;
    
    return null;
  };

  const handleTrackPlay = (track: any) => {
    const artworkUrl = getArtworkUrl(track.artwork);
    
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist: track.user?.name || track.artist,
      duration: formatDuration(track.duration || 0),
      cover: artworkUrl,
      audiusId: track.id
    };
    
    setSelectedTrack(transformedTrack);
    setShowPlayer(true);
  };

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
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending This Week
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Hot Tracks on <span className="gradient-primary bg-clip-text text-transparent">Audius</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover the most popular tracks trending right now on the Audius platform
            </p>
          </div>
        </div>
      </section>

      {/* Trending Tracks Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Top {trendingTracks.length} Trending Tracks
            </h2>
            <div className="text-sm text-muted-foreground">
              Updated every hour
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tracksLoading ? (
              // Loading skeletons
              [...Array(20)].map((_, index) => (
                <Card key={index} className="overflow-hidden shadow-card bg-card">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              trendingTracks.map((track, index) => (
                <Card 
                  key={track.id} 
                  className="overflow-hidden shadow-card bg-card hover:shadow-glow transition-smooth group cursor-pointer"
                  onClick={() => handleTrackPlay(track)}
                >
                  {/* Track Artwork */}
                  <div className="relative">
                    {getArtworkUrl(track.artwork) ? (
                      <img
                        src={getArtworkUrl(track.artwork)}
                        alt={track.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-48 bg-muted flex items-center justify-center"><div class="text-4xl">🎵</div></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <div className="text-4xl">🎵</div>
                      </div>
                    )}
                    
                    {/* Rank Badge */}
                    <div className="absolute top-3 left-3 bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      #{index + 1}
                    </div>
                    
                    {/* Play Count Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {track.play_count?.toLocaleString() || '0'} plays
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="lg"
                        className="h-14 w-14 rounded-full gradient-primary shadow-glow hover:scale-110 transition-transform"
                      >
                        <Play className="h-6 w-6 ml-0.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-smooth line-clamp-1">
                          {track.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          by {track.user.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(track.duration || 0)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Genre & Actions */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {track.genre || 'Music'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <FavoriteButton trackId={track.id} size="sm" />
                        <AddToPlaylistDialog trackId={track.id}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </AddToPlaylistDialog>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Audio Player */}
      {showPlayer && selectedTrack && (
        <AudioPlayer 
          key={selectedTrack.id}
          initialTrack={selectedTrack}
          initialQueue={trendingTracks.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.user?.name || 'Unknown Artist',
            duration: formatDuration(track.duration || 0),
            cover: getArtworkUrl(track.artwork),
            audiusId: track.id
          }))}
          isCompact 
          showQueue
        />
      )}
    </div>
  );
};

export default Trending;