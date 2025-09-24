import { useState, useCallback } from 'react';
import { audiusService, AudiusTrack } from '@/services/audius';
import { useToast } from '@/hooks/use-toast';

interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover: string | null;
  audiusId: string;
}

export const useRadioStation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createRadioQueue = useCallback(async (): Promise<RadioTrack[]> => {
    try {
      setIsLoading(true);

      // Fetch a larger set of trending tracks for variety
      const allTrendingTracks = await audiusService.getTrendingTracks(100);
      
      if (allTrendingTracks.length === 0) {
        throw new Error('No tracks available');
      }

      // Group tracks by artist to ensure variety
      const tracksByArtist = new Map<string, AudiusTrack[]>();
      
      allTrendingTracks.forEach(track => {
        const artistId = track.user?.id || 'unknown';
        if (!tracksByArtist.has(artistId)) {
          tracksByArtist.set(artistId, []);
        }
        tracksByArtist.get(artistId)!.push(track);
      });

      // Select one random track from each artist (up to 50 artists for a good queue)
      const radioTracks: AudiusTrack[] = [];
      const artistIds = Array.from(tracksByArtist.keys());
      const shuffledArtists = shuffleArray(artistIds).slice(0, 50);

      shuffledArtists.forEach(artistId => {
        const artistTracks = tracksByArtist.get(artistId)!;
        const randomTrack = artistTracks[Math.floor(Math.random() * artistTracks.length)];
        radioTracks.push(randomTrack);
      });

      // Shuffle the final radio queue for maximum randomness
      const shuffledRadioTracks = shuffleArray(radioTracks);

      // Transform to our radio track format
      const transformedTracks: RadioTrack[] = shuffledRadioTracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.user?.name || 'Unknown Artist',
        duration: formatDuration(track.duration || 0),
        cover: getArtworkUrl(track.artwork),
        audiusId: track.id,
      }));

      toast({
        title: "🎵 Radio Station Started",
        description: `Loaded ${transformedTracks.length} tracks from different artists`,
      });

      return transformedTracks;

    } catch (error) {
      console.error('Error creating radio queue:', error);
      
      toast({
        title: "Radio Station Error",
        description: "Failed to create radio queue. Please try again.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    createRadioQueue,
    isLoading,
  };
};