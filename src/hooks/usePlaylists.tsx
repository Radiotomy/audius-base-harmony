import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  track_count?: number;
}

interface PlaylistTrack {
  id: string;
  track_id: string;
  position: number;
  added_at: string;
}

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's playlists
  useEffect(() => {
    if (!user) {
      setPlaylists([]);
      return;
    }

    fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_playlists')
        .select(`
          *,
          playlist_tracks(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const playlistsWithCounts = data?.map(playlist => ({
        ...playlist,
        track_count: playlist.playlist_tracks?.[0]?.count || 0
      })) || [];
      
      setPlaylists(playlistsWithCounts);
    } catch (error: any) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (name: string, description?: string, isPublic: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create playlists",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      const newPlaylist = { ...data, track_count: 0 };
      setPlaylists(prev => [newPlaylist, ...prev]);
      
      toast({
        title: "Playlist Created",
        description: `"${name}" has been created`,
      });

      return newPlaylist;
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create playlist",
        variant: "destructive",
      });
      return null;
    }
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    if (!user) return false;

    try {
      // Get current track count for position
      const { count } = await supabase
        .from('playlist_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('playlist_id', playlistId);

      const { error } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: trackId,
          position: (count || 0) + 1
        });

      if (error) throw error;

      // Update local state
      setPlaylists(prev => 
        prev.map(playlist => 
          playlist.id === playlistId 
            ? { ...playlist, track_count: (playlist.track_count || 0) + 1 }
            : playlist
        )
      );

      toast({
        title: "Track Added",
        description: "Track added to playlist",
      });

      return true;
    } catch (error: any) {
      console.error('Error adding track to playlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add track to playlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId);

      if (error) throw error;

      // Update local state
      setPlaylists(prev => 
        prev.map(playlist => 
          playlist.id === playlistId 
            ? { ...playlist, track_count: Math.max((playlist.track_count || 0) - 1, 0) }
            : playlist
        )
      );

      toast({
        title: "Track Removed",
        description: "Track removed from playlist",
      });

      return true;
    } catch (error: any) {
      console.error('Error removing track from playlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove track from playlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      
      toast({
        title: "Playlist Deleted",
        description: "Playlist has been removed",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete playlist",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    playlists,
    loading,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,
    refetch: fetchPlaylists
  };
};