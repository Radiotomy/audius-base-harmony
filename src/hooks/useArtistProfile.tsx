import { useState, useEffect } from 'react';
import { audiusService, AudiusUser, AudiusTrack } from '@/services/audius';
import { useToast } from '@/hooks/use-toast';

interface ArtistProfileData {
  artist: AudiusUser | null;
  tracks: AudiusTrack[];
  playlists: any[]; // Placeholder for future playlist support
  loading: boolean;
  error: string | null;
}

export const useArtistProfile = (artistId: string): ArtistProfileData => {
  const [artist, setArtist] = useState<AudiusUser | null>(null);
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!artistId) {
      setLoading(false);
      return;
    }

    const fetchArtistProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch artist profile and tracks in parallel
        const [artistData, tracksData] = await Promise.all([
          audiusService.getUser(artistId),
          audiusService.getUserTracks(artistId, 50) // Get more tracks for profile
        ]);

        if (!artistData) {
          setError('Artist not found');
          return;
        }

        setArtist(artistData);
        setTracks(tracksData || []);
        setPlaylists([]); // Placeholder for future playlist support

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch artist profile';
        setError(errorMessage);
        console.error('Error fetching artist profile:', err);
        
        toast({
          title: "Failed to load artist profile",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArtistProfile();
  }, [artistId, toast]);

  return {
    artist,
    tracks,
    playlists,
    loading,
    error
  };
};