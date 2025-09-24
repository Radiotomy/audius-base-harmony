import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Music, User, TrendingUp, Play, Heart, MoreHorizontal } from 'lucide-react';
import { useAudiusSearch } from '@/hooks/useAudius';
import { usePlayer } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { audiusService } from '@/services/audius';
import TrackCard from '@/components/TrackCard';
import ArtistCard from '@/components/ArtistCard';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const genre = searchParams.get('genre');
  const duration = searchParams.get('duration');
  
  const { results, loading, search } = useAudiusSearch();
  const { play, addToQueue } = usePlayer();
  const { toggleFavorite, isFavorited } = useFavorites();

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('audiobase-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query) {
      search(query, type as any);
    }
  }, [query, type, search]);

  const handleTrackPlay = async (track: any) => {
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist: track.user?.name || 'Unknown Artist',
      duration: `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`,
      cover: track.artwork?.['480x480'] || track.artwork?.['150x150'],
      audiusId: track.id,
    };
    const allTracks = results.tracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.user?.name || 'Unknown Artist',
      duration: `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, '0')}`,
      cover: t.artwork?.['480x480'] || t.artwork?.['150x150'],
      audiusId: t.id,
    }));
    await play(transformedTrack, allTracks, true);
  };

  const handleTrackQueue = (track: any) => {
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist: track.user?.name || 'Unknown Artist',
      duration: `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`,
      cover: track.artwork?.['480x480'] || track.artwork?.['150x150'],
      audiusId: track.id,
    };
    addToQueue(transformedTrack);
  };

  const handleArtistPlay = async (user: any) => {
    try {
      const tracks = await audiusService.getUserTracks(user.id, 10);
      if (tracks.length > 0) {
        const topTrack = tracks[0];
        const transformedTrack = {
          id: topTrack.id,
          title: topTrack.title,
          artist: topTrack.user.name,
          duration: `${Math.floor(topTrack.duration / 60)}:${String(topTrack.duration % 60).padStart(2, '0')}`,
          cover: topTrack.artwork?.['480x480'] || topTrack.artwork?.['150x150'],
          audiusId: topTrack.id,
        };
        
        const allTracks = tracks.map(t => ({
          id: t.id,
          title: t.title,
          artist: t.user.name,
          duration: `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, '0')}`,
          cover: t.artwork?.['480x480'] || t.artwork?.['150x150'],
          audiusId: t.id,
        }));
        
        await play(transformedTrack, allTracks, true);
      }
    } catch (error) {
      console.error('Failed to play artist tracks:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Search AudioBASE</h1>
            <p className="text-muted-foreground mb-8">
              Discover amazing music from Audius creators
            </p>
            
            {recentSearches.length > 0 && (
              <Card className="max-w-md mx-auto p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(search)}`)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Search Results</h1>
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : `Found ${results.tracks.length + results.users.length} results for "${query}"`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link to={`/search?q=${encodeURIComponent(query)}`}>
            <Badge variant={type === 'all' ? 'default' : 'secondary'}>
              All ({results.tracks.length + results.users.length})
            </Badge>
          </Link>
          <Link to={`/search?q=${encodeURIComponent(query)}&type=tracks`}>
            <Badge variant={type === 'tracks' ? 'default' : 'secondary'}>
              Tracks ({results.tracks.length})
            </Badge>
          </Link>
          <Link to={`/search?q=${encodeURIComponent(query)}&type=users`}>
            <Badge variant={type === 'users' ? 'default' : 'secondary'}>
              Artists ({results.users.length})
            </Badge>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Tabs value={type} onValueChange={(value) => navigate(`/search?q=${encodeURIComponent(query)}&type=${value}`)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="users">Artists</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {/* Top Tracks */}
              {results.tracks.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Top Tracks</h2>
                  </div>
                  <div className="grid gap-4">
                    {results.tracks.slice(0, 6).map((track) => (
                      <Card key={track.id} className="p-4">
                        <div className="flex items-center gap-4">
                          {track.artwork?.['150x150'] && (
                            <img
                              src={track.artwork['150x150']}
                              alt={track.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{track.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {track.user?.name}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {track.play_count?.toLocaleString()} plays
                              </span>
                              <span>{formatDuration(track.duration)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handleTrackPlay(track)}
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => toggleFavorite(track.id)}
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 ${isFavorited(track.id) ? 'text-red-500' : ''}`}
                            >
                              <Heart className={`h-3 w-3 ${isFavorited(track.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              onClick={() => handleTrackQueue(track)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Artists */}
              {results.users.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Artists</h2>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.slice(0, 6).map((user) => (
                      <ArtistCard
                        key={user.id}
                        artist={{
                          id: user.id,
                          name: user.name,
                          followers: user.follower_count?.toLocaleString() || '0',
                          avatar: user.profile_picture?.['150x150'],
                          verified: false,
                          genre: 'Music'
                        }}
                        onPlay={() => handleArtistPlay(user)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="tracks">
              <div className="grid gap-4">
                {results.tracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onPlay={() => handleTrackPlay(track)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.users.map((user) => (
                  <ArtistCard
                    key={user.id}
                    artist={{
                      id: user.id,
                      name: user.name,
                      followers: user.follower_count?.toLocaleString() || '0',
                      avatar: user.profile_picture?.['150x150'],
                      verified: false,
                      genre: 'Music'
                    }}
                    onPlay={() => handleArtistPlay(user)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!loading && results.tracks.length === 0 && results.users.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or browse trending content
            </p>
            <Button asChild>
              <Link to="/trending">Browse Trending</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;