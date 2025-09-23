import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, TrendingUp, Users, Zap, ExternalLink, ChevronRight, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AudioPlayer from '@/components/AudioPlayer';
import ArtistCard from '@/components/ArtistCard';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import FavoriteButton from '@/components/FavoriteButton';
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog';
import WalletConnect from '@/components/OnchainWallet';
import { useAudiusTrendingTracks } from '@/hooks/useAudius';
import { audiusService } from '@/services/audius';
import { testWithTrendingTrack } from '@/utils/audioStreamTest';
import heroImage from '@/assets/hero-audiobase.jpg';

const Index = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  
  // Fetch real Audius data
  const { tracks: trendingTracks, loading: tracksLoading } = useAudiusTrendingTracks(6);

  // Transform Audius data for featured artists (using trending artists from tracks)
  const featuredArtists = React.useMemo(() => {
    const artistMap = new Map();
    
    trendingTracks.forEach(track => {
      if (!artistMap.has(track.user.id)) {
        artistMap.set(track.user.id, {
          id: track.user.id,
          name: track.user.name,
          followers: '0', // We'll need to fetch this separately
          avatar: track.user.profile_picture?.['150x150'],
          genre: track.genre || 'Various',
          topTrack: track.title
        });
      }
    });
    
    return Array.from(artistMap.values()).slice(0, 3);
  }, [trendingTracks]);

  // Test audio streaming on component mount (development only)
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
    
    // Handle different Audius artwork formats
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
      audiusId: track.id  // Critical: Add the audiusId field for streaming
    };
    
    setSelectedTrack(transformedTrack);
    setShowPlayer(true);
    
    console.log('Playing track:', transformedTrack.title, 'audiusId:', transformedTrack.audiusId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 gradient-primary opacity-60" />
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <Badge className="gradient-accent px-4 py-2 text-sm font-medium">
                🎵 Audius × Base Integration
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground">
                Audio<span className="gradient-primary bg-clip-text text-transparent">BASE</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Stream Audius music while unlocking Base blockchain monetization. 
                Tip artists, mint collectibles, and own your music experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="gradient-primary hover:scale-105 transition-bounce shadow-glow px-8 py-6 text-lg"
                onClick={() => {
                  if (trendingTracks.length > 0) {
                    handleTrackPlay(trendingTracks[0]);
                  }
                }}
                disabled={trendingTracks.length === 0}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Listening
              </Button>
              <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-6 text-lg"
                  >
                    Connect Wallet
                    <ExternalLink className="h-5 w-5 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Connect Your Wallet</DialogTitle>
                  </DialogHeader>
                  <WalletConnect />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-center pt-8">
              <WaveformVisualizer isPlaying={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center shadow-card bg-card/50 backdrop-blur-sm border-border">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">125K+</div>
              <div className="text-muted-foreground">Tracks Streamed</div>
            </Card>
            <Card className="p-6 text-center shadow-card bg-card/50 backdrop-blur-sm border-border">
              <Users className="h-8 w-8 text-secondary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">12K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </Card>
            <Card className="p-6 text-center shadow-card bg-card/50 backdrop-blur-sm border-border">
              <Zap className="h-8 w-8 text-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">45 ETH</div>
              <div className="text-muted-foreground">Tips Distributed</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trending Tracks */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
            <Button variant="ghost">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tracksLoading ? (
              // Loading skeletons
              [...Array(6)].map((_, index) => (
                <Card key={index} className="p-6 shadow-card bg-card">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="text-2xl font-bold w-8 h-8" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </Card>
              ))
            ) : (
              trendingTracks.slice(0, 6).map((track, index) => (
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
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-smooth line-clamp-1">
                          {track.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          by {track.user.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(track.duration || 0)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FavoriteButton trackId={track.id} size="sm" />
                        <AddToPlaylistDialog trackId={track.id}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </AddToPlaylistDialog>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-accent font-medium">🎵 Audius</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Artists</h2>
            <Button variant="ghost">
              Discover More <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArtists.map((artist) => (
              <ArtistCard 
                key={artist.id} 
                artist={artist}
                onPlay={() => handleTrackPlay({ 
                  id: artist.id, 
                  title: artist.topTrack, 
                  user: { name: artist.name } 
                })}
                onTip={() => console.log('Tip artist:', artist.name)}
              />
            ))}
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

        {showPlayer && selectedTrack && (
          <AudioPlayer 
            key={selectedTrack.id} // Force re-render when track changes
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

export default Index;