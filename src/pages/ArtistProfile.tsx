import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Play, 
  Heart, 
  Share, 
  ExternalLink, 
  Music, 
  Users, 
  MapPin,
  Globe,
  Twitter,
  Instagram
} from 'lucide-react';
import TrackCard from '@/components/TrackCard';
import TipArtistDialog from '@/components/TipArtistDialog';
import EnhancedAudioPlayer from '@/components/EnhancedAudioPlayer';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { usePlayer } from '@/contexts/PlayerContext';

const ArtistProfile = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  
  const { 
    artist, 
    tracks, 
    playlists,
    loading, 
    error 
  } = useArtistProfile(artistId || '');
  
  const { play, ...player } = usePlayer();

  // Show player when track is playing
  useEffect(() => {
    setShowPlayer(!!player.currentTrack);
  }, [player.currentTrack]);

  const handlePlayAllTracks = async () => {
    if (tracks.length > 0) {
      const transformedTracks = tracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.user.name,
        duration: `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`,
        cover: track.artwork?.['480x480'] || track.artwork?.['150x150'],
        audiusId: track.id,
      }));
      
      await play(transformedTracks[0], transformedTracks, true);
    }
  };

  const handleTipArtist = () => {
    setShowTipDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Loading skeleton */}
        <div className="relative">
          <Skeleton className="w-full h-64" />
          <div className="container mx-auto px-4 relative -mt-20">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Artist Not Found</h2>
          <p className="text-muted-foreground mb-4">The artist profile you're looking for doesn't exist.</p>
          <Link to="/artists">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Artists
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with cover photo */}
      <div className="relative">
        {/* Cover Photo */}
        <div 
          className="w-full h-64 bg-gradient-to-r from-primary/20 to-accent/20 relative"
          style={{
            backgroundImage: artist.cover_photo?.['2000x'] 
              ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${artist.cover_photo['2000x']})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Navigation */}
          <div className="absolute top-4 left-4 z-10">
            <Link to="/artists">
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          {/* AudioBASE Branding */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-primary text-primary-foreground">
              AudioBASE Artist
            </Badge>
          </div>
        </div>

        {/* Artist Info Overlay */}
        <div className="container mx-auto px-4 relative -mt-20">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            {/* Artist Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-background bg-background p-1 shadow-glow">
                {artist.profile_picture?.['480x480'] ? (
                  <img
                    src={artist.profile_picture['480x480']}
                    alt={artist.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full gradient-primary flex items-center justify-center text-2xl font-bold">
                    {artist.name.charAt(0)}
                  </div>
                )}
              </div>
              {artist.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <span className="text-sm text-primary-foreground">✓</span>
                </div>
              )}
            </div>

            {/* Artist Details */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {artist.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                @{artist.handle}
              </p>
              
              {/* Stats */}
              <div className="flex gap-6 justify-center md:justify-start text-sm mb-4">
                <div className="text-center md:text-left">
                  <div className="font-semibold text-foreground">{artist.follower_count?.toLocaleString()}</div>
                  <div className="text-muted-foreground">Followers</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="font-semibold text-foreground">{artist.track_count}</div>
                  <div className="text-muted-foreground">Tracks</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="font-semibold text-foreground">{artist.followee_count}</div>
                  <div className="text-muted-foreground">Following</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center md:justify-start">
                <Button 
                  onClick={handlePlayAllTracks}
                  className="gradient-primary"
                  disabled={tracks.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play All
                </Button>
                <Button 
                  onClick={handleTipArtist}
                  variant="outline"
                >
                  💎 Tip Artist
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="tracks">
              <Music className="h-4 w-4 mr-2" />
              Tracks
            </TabsTrigger>
            <TabsTrigger value="about">
              <Users className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="playlists">
              <Music className="h-4 w-4 mr-2" />
              Playlists
            </TabsTrigger>
          </TabsList>

          {/* Tracks Tab */}
          <TabsContent value="tracks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tracks ({tracks.length})</h2>
              {tracks.length > 0 && (
                <Button onClick={handlePlayAllTracks} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Play All
                </Button>
              )}
            </div>
            
            <div className="grid gap-4">
              {tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={{
                    id: track.id,
                    title: track.title,
                    user: { name: track.user.name },
                    artwork: track.artwork,
                    play_count: track.play_count,
                    duration: track.duration,
                  }}
                  className="bg-card"
                />
              ))}
              
              {tracks.length === 0 && (
                <Card className="p-8 text-center">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                  <p className="text-muted-foreground">This artist hasn't uploaded any tracks.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">About {artist.name}</h2>
              
              {artist.bio ? (
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {artist.bio}
                </p>
              ) : (
                <p className="text-muted-foreground italic mb-6">
                  No bio available for this artist.
                </p>
              )}

              {/* Location and Social Links */}
              <div className="space-y-4">
                {artist.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{artist.location}</span>
                  </div>
                )}
                
                {/* Social Links would go here if available from Audius API */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Audius
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="space-y-6">
            <h2 className="text-2xl font-bold">Playlists</h2>
            
            <Card className="p-8 text-center">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Playlists coming soon</h3>
              <p className="text-muted-foreground">Artist playlist functionality will be available soon.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Tip Artist Dialog */}
      <TipArtistDialog
        open={showTipDialog}
        onOpenChange={setShowTipDialog}
        artist={{
          id: artist.id,
          name: artist.name,
          avatar: artist.profile_picture?.['480x480']
        }}
      />

      {/* Audio Player */}
      {showPlayer && player.currentTrack && (
        <EnhancedAudioPlayer
          isCompact={true}
          showEqualizer={true}
          showQueue={true}
        />
      )}
    </div>
  );
};

export default ArtistProfile;