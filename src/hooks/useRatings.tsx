import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TrackRating {
  id: string;
  user_id: string;
  track_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface RatingStats {
  average: number;
  count: number;
  distribution: { [key: number]: number };
}

export const useRatings = (trackId?: string) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's rating for a track
  const fetchUserRating = useCallback(async (targetTrackId?: string) => {
    if (!user?.id || (!trackId && !targetTrackId)) return;
    
    const trackToCheck = targetTrackId || trackId!;
    
    try {
      const { data, error } = await supabase
        .from('track_ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('track_id', trackToCheck)
        .maybeSingle();

      if (error) throw error;

      setUserRating(data?.rating || null);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  }, [user?.id, trackId]);

  // Fetch rating statistics for a track
  const fetchRatingStats = useCallback(async (targetTrackId?: string) => {
    if (!trackId && !targetTrackId) return;
    
    const trackToCheck = targetTrackId || trackId!;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('track_ratings')
        .select('rating')
        .eq('track_id', trackToCheck);

      if (error) throw error;

      if (!data || data.length === 0) {
        setRatingStats({
          average: 0,
          count: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
        return;
      }

      // Calculate statistics
      const ratings = data.map(r => r.rating);
      const count = ratings.length;
      const sum = ratings.reduce((acc, rating) => acc + rating, 0);
      const average = count > 0 ? sum / count : 0;

      // Calculate distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        distribution[rating as keyof typeof distribution]++;
      });

      setRatingStats({
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count,
        distribution
      });
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      toast({
        title: "Error",
        description: "Failed to load ratings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  // Rate a track
  const rateTrack = useCallback(async (targetTrackId: string, rating: number) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to rate tracks",
        variant: "destructive",
      });
      return false;
    }

    if (rating < 1 || rating > 5) {
      toast({
        title: "Invalid Rating",
        description: "Rating must be between 1 and 5 stars",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('track_ratings')
        .upsert({
          user_id: user.id,
          track_id: targetTrackId,
          rating: rating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,track_id'
        });

      if (error) throw error;

      // Update local state
      if (targetTrackId === trackId) {
        setUserRating(rating);
        await fetchRatingStats(targetTrackId);
      }

      toast({
        title: "Success",
        description: `Rated ${rating} star${rating !== 1 ? 's' : ''}`,
      });
      return true;
    } catch (error) {
      console.error('Error rating track:', error);
      toast({
        title: "Error",
        description: "Failed to rate track",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, trackId, fetchRatingStats]);

  // Remove rating
  const removeRating = useCallback(async (targetTrackId?: string) => {
    if (!user?.id) return false;
    
    const trackToRate = targetTrackId || trackId!;
    
    try {
      const { error } = await supabase
        .from('track_ratings')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackToRate);

      if (error) throw error;

      // Update local state
      if (trackToRate === trackId) {
        setUserRating(null);
        await fetchRatingStats(trackToRate);
      }

      toast({
        title: "Success",
        description: "Rating removed",
      });
      return true;
    } catch (error) {
      console.error('Error removing rating:', error);
      toast({
        title: "Error",
        description: "Failed to remove rating",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, trackId, fetchRatingStats]);

  // Get top rated tracks
  const getTopRatedTracks = useCallback(async (limit: number = 10) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('track_ratings')
        .select(`
          track_id,
          rating,
          audius_tracks (
            id,
            title,
            artist_name,
            artwork_url,
            play_count
          )
        `)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Group by track and calculate averages
      const trackRatings = new Map();
      data?.forEach(item => {
        if (!trackRatings.has(item.track_id)) {
          trackRatings.set(item.track_id, {
            track: item.audius_tracks,
            ratings: []
          });
        }
        trackRatings.get(item.track_id).ratings.push(item.rating);
      });

      // Calculate averages and sort
      const topTracks = Array.from(trackRatings.values())
        .map(item => ({
          ...item.track,
          averageRating: item.ratings.reduce((a: number, b: number) => a + b, 0) / item.ratings.length,
          ratingCount: item.ratings.length
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, limit);

      return topTracks;
    } catch (error) {
      console.error('Error fetching top rated tracks:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    if (trackId) {
      fetchUserRating();
      fetchRatingStats();
    }
  }, [trackId, fetchUserRating, fetchRatingStats]);

  return {
    userRating,
    ratingStats,
    loading,
    rateTrack,
    removeRating,
    fetchUserRating,
    fetchRatingStats,
    getTopRatedTracks,
  };
};