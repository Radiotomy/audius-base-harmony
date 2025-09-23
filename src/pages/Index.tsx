import React from 'react';
import { Play, Heart, Users, TrendingUp, Zap, Plus } from 'lucide-react';
import { useAudiusTrendingTracks } from '@/hooks/useAudius';
import TrackCard from '@/components/TrackCard';
import ArtistCard from '@/components/ArtistCard';
import AudioPlayer from '@/components/AudioPlayer';
import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/contexts/PlayerContext';
import FavoriteButton from '@/components/FavoriteButton';
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { testWithTrendingTrack } from '@/utils/audioStreamTest';
import Navigation from '@/components/Navigation';

const Index = () => {
  const [showPlayer, setShowPlayer] = React.useState(false);
  const { user } = useAuth();
  const player = usePlayer();
  const { tracks: trendingTracks, loading, error } = useAudiusTrendingTracks(6);

  // Get top 3 artists from trending tracks
  const featuredArtists = React.useMemo(() => {
    if (!trendingTracks || trendingTracks.length === 0) return [];
    
    const uniqueArtists = trendingTracks
      .filter((track, index, self) => 
        index === self.findIndex(t => t.user?.name === track.user?.name)
      )
      .slice(0, 3)
      .map(track => ({
        id: track.user?.handle || track.id,
        name: track.user?.name || 'Unknown Artist',
        followers: `${Math.floor(Math.random() * 100000)} followers`,
        verified: false, // Default to false since property doesn't exist
        avatar: track.user?.profile_picture?.['150x150'],
        genre: track.genre,
        topTrack: track.title
      }));
    
    return uniqueArtists;
  }, [trendingTracks]);

  // Test audio streaming on component mount (dev only)
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      // Automatically test audio streaming when component loads
      testWithTrendingTrack()
        .then((result) => {
          console.log('🎉 Audio streaming test successful:', result);
        })
        .catch((error) => {
          console.error('⚠️  Audio streaming test failed:', error);
        });
    }
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getArtworkUrl = (artwork: any) => {
    if (!artwork) return null;
    if (artwork['480x480']) return artwork['480x480'];
    if (artwork['150x150']) return artwork['150x150'];
    if (artwork.large) return artwork.large;
    if (artwork.small) return artwork.small;
    
    return null;
  };

  // Transform track data and handle play
  const handleTrackPlay = async (track: any) => {
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist: track.user?.name || track.artist,
      duration: formatDuration(track.duration || 0),
      cover: getArtworkUrl(track.artwork),
      audiusId: track.id,
    };

    // Transform entire queue for context
    const transformedQueue = trendingTracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.user?.name || 'Unknown Artist',
      duration: formatDuration(t.duration || 0),
      cover: getArtworkUrl(t.artwork),
      audiusId: t.id,
    }));

    await player.play(transformedTrack, transformedQueue, true);
    setShowPlayer(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-audiobase.jpg')] bg-cover bg-center bg-no-repeat opacity-20" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            AudioBASE
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Stream Audius music seamlessly while tipping artists on Base. The future of Web3 music discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-primary hover:scale-105 transition-bounce">
              <Play className="mr-2 h-5 w-5" />
              Start Listening
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth">
              Connect Wallet
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground">1M+</h3>
              <p className="text-muted-foreground">Tracks Streamed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground">50K+</h3>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-success-green rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground">$100K+</h3>
              <p className="text-muted-foreground">Tips Distributed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Tracks Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">Error loading tracks: {error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTracks.map((track) => (
                <Card key={track.id} className="group overflow-hidden hover:shadow-glow transition-smooth">
                  <div className="relative">
                    {track.artwork?.['480x480'] && (
                      <img
                        src={track.artwork['480x480']}
                        alt={track.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        onClick={() => handleTrackPlay(track)}
                        size="lg"
                        className="h-14 w-14 rounded-full gradient-primary shadow-glow hover:scale-110 transition-transform"
                      >
                        <Play className="h-6 w-6 ml-0.5" />
                      </Button>
                    </div>

                    {/* Stats Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {track.play_count ? `${Math.floor(track.play_count / 1000)}K` : '0'} plays
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-smooth">
                          {track.title}
                        </h3>
                        <p className="text-muted-foreground text-sm truncate">
                          by {track.user?.name || 'Unknown Artist'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {user && (
                      <div className="flex items-center gap-2">
                        <FavoriteButton trackId={track.id} size="sm" />
                        <AddToPlaylistDialog trackId={track.id}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </AddToPlaylistDialog>
                        <Button
                          onClick={() => handleTrackPlay(track)}
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-primary hover:text-primary/80"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Featured Artists
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArtists.map((artist) => {
              // Find the actual track data for this artist
              const artistTrack = trendingTracks.find(track => track.user?.name === artist.name);
              
              return (
                <ArtistCard 
                  key={artist.id} 
                  artist={artist}
                  onPlay={() => {
                    if (artistTrack) {
                      handleTrackPlay(artistTrack);
                    } else {
                      console.warn('No track found for artist:', artist.name);
                    }
                  }}
                  onTip={() => console.log('Tip artist:', artist.name)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Web3 Music Experience
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            AudioBASE bridges Audius streaming with Base blockchain, creating new ways for fans to support artists.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 shadow-card bg-card/50">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Stream Audius</h3>
              <p className="text-sm text-muted-foreground">
                Access millions of tracks from Audius with seamless playback
              </p>
            </Card>
            
            <Card className="p-6 shadow-card bg-card/50">
              <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tip Artists</h3>
              <p className="text-sm text-muted-foreground">
                Send ETH or stablecoins directly to your favorite artists
              </p>
            </Card>
            
            <Card className="p-6 shadow-card bg-card/50">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">🎨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Mint NFTs</h3>
              <p className="text-sm text-muted-foreground">
                Collect exclusive music NFTs and unlock premium content
              </p>
            </Card>
            
            <Card className="p-6 shadow-card bg-card/50">
              <div className="w-12 h-12 bg-success-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">💎</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Own Music</h3>
              <p className="text-sm text-muted-foreground">
                Buy high-quality downloads and support artists directly
              </p>
            </Card>
          </div>
        </div>
      </section>

        {/* Audio Player */}
        {showPlayer && player.currentTrack && (
          <AudioPlayer
            showEqualizer={true}
          />
        )}
    </div>
  );
};

export default Index;