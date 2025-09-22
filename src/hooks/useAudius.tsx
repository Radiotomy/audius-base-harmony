import { useState, useEffect } from 'react';
import { audiusService, AudiusTrack, AudiusUser } from '@/services/audius';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAudiusTrendingTracks = (limit: number = 10) => {
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrendingTracks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const audiusTracks = await audiusService.getTrendingTracks(limit);
        setTracks(audiusTracks);

        // Cache tracks in Supabase for faster subsequent loads (only if authenticated)
        if (audiusTracks.length > 0) {
          const transformedTracks = audiusTracks.map(track => 
            audiusService.transformTrack(track)
          );
          
          // Check if user is authenticated before attempting to cache
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Upsert tracks (requires authentication)
            const { error: cacheError } = await supabase
              .from('audius_tracks')
              .upsert(transformedTracks, { onConflict: 'id' });

            if (cacheError) {
              console.warn('Could not cache tracks:', cacheError.message);
            }
          } else {
            console.log('Skipping track caching - user not authenticated');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trending tracks';
        setError(errorMessage);
        console.error('Error fetching trending tracks:', err);
        
        toast({
          title: "Failed to load trending tracks",
          description: "Using cached data if available",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTracks();
  }, [limit, toast]);

  return { tracks, loading, error };
};

export const useAudiusSearch = () => {
  const [results, setResults] = useState<{ tracks: AudiusTrack[]; users: AudiusUser[] }>({
    tracks: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, type: 'tracks' | 'users' | 'all' = 'all') => {
    if (!query.trim()) {
      setResults({ tracks: [], users: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const promises = [];
      
      if (type === 'tracks' || type === 'all') {
        promises.push(audiusService.searchTracks(query, 10));
      } else {
        promises.push(Promise.resolve([]));
      }
      
      if (type === 'users' || type === 'all') {
        promises.push(audiusService.searchUsers(query, 10));
      } else {
        promises.push(Promise.resolve([]));
      }

      const [tracks, users] = await Promise.all(promises);
      
      setResults({
        tracks: tracks as AudiusTrack[],
        users: users as AudiusUser[]
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
};

export const useAudiusUserTracks = (userId: string) => {
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserTracks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userTracks = await audiusService.getUserTracks(userId, 5);
        setTracks(userTracks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user tracks';
        setError(errorMessage);
        console.error('Error fetching user tracks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTracks();
  }, [userId]);

  return { tracks, loading, error };
};

export const useAudiusStreamUrl = (trackId: string | null) => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trackId) {
      setStreamUrl(null);
      return;
    }

    console.log('Fetching stream URL for track ID:', trackId);

    const getStreamUrl = async () => {
      try {
        setLoading(true);
        const url = await audiusService.getStreamUrl(trackId);
        console.log('Stream URL received:', url);
        setStreamUrl(url);
      } catch (err) {
        console.error('Error getting stream URL:', err);
        setStreamUrl(null);
      } finally {
        setLoading(false);
      }
    };

    getStreamUrl();
  }, [trackId]);

  return { streamUrl, loading };
};