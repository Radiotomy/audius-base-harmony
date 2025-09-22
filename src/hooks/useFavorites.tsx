import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's favorites
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('track_id')
          .eq('user_id', user.id);

        if (error) throw error;
        setFavorites(data?.map(f => f.track_id) || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (trackId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const isFavorited = favorites.includes(trackId);
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', trackId);

        if (error) throw error;
        
        setFavorites(prev => prev.filter(id => id !== trackId));
        toast({
          title: "Removed from favorites",
          description: "Track removed from your favorites",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            track_id: trackId
          });

        if (error) throw error;
        
        setFavorites(prev => [...prev, trackId]);
        toast({
          title: "Added to favorites",
          description: "Track added to your favorites",
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFavorited = (trackId: string) => favorites.includes(trackId);

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    loading
  };
};