import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Album {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  cover_art_url?: string;
  release_date?: string;
  album_type: 'single' | 'ep' | 'album';
  genre: string;
  tags?: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  tracks?: AlbumTrack[];
}

export interface AlbumTrack {
  id: string;
  album_id: string;
  track_id: string;
  track_number: number;
  created_at: string;
  track?: {
    id: string;
    title: string;
    duration?: number;
    audio_file_url: string;
    artwork_url?: string;
    play_count: number;
  };
}

export interface CreateAlbumData {
  title: string;
  description?: string;
  cover_art_url?: string;
  release_date?: string;
  album_type: 'single' | 'ep' | 'album';
  genre: string;
  tags?: string[];
  is_published?: boolean;
}

export interface UpdateAlbumData extends Partial<CreateAlbumData> {
  id: string;
}

export const useAlbums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAlbums = async () => {
    if (!user) {
      setAlbums([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          album_tracks (
            *,
            track:artist_uploads (
              id,
              title,
              duration,
              audio_file_url,
              artwork_url,
              play_count
            )
          )
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAlbums(data as Album[] || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast({
        title: "Error",
        description: "Failed to load albums",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async (albumData: CreateAlbumData): Promise<Album | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create albums",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('albums')
        .insert({
          ...albumData,
          artist_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAlbums(prev => [data as Album, ...prev]);
      
      toast({
        title: "Album Created",
        description: `${albumData.title} has been created successfully`,
      });

      return data as Album;
    } catch (error: any) {
      console.error('Error creating album:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create album",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAlbum = async (albumData: UpdateAlbumData): Promise<Album | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update albums",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { id, ...updateData } = albumData;
      const { data, error } = await supabase
        .from('albums')
        .update(updateData)
        .eq('id', id)
        .eq('artist_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAlbums(prev => prev.map(album => 
        album.id === id ? data as Album : album
      ));

      toast({
        title: "Album Updated",
        description: `${data.title} has been updated successfully`,
      });

      return data as Album;
    } catch (error: any) {
      console.error('Error updating album:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update album",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteAlbum = async (albumId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete albums",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId)
        .eq('artist_id', user.id);

      if (error) throw error;

      setAlbums(prev => prev.filter(album => album.id !== albumId));

      toast({
        title: "Album Deleted",
        description: "Album has been deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting album:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete album",
        variant: "destructive",
      });
      return false;
    }
  };

  const addTrackToAlbum = async (albumId: string, trackId: string, trackNumber: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to manage album tracks",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('album_tracks')
        .insert({
          album_id: albumId,
          track_id: trackId,
          track_number: trackNumber,
        });

      if (error) throw error;

      // Refresh albums to get updated track list
      await fetchAlbums();

      toast({
        title: "Track Added",
        description: "Track has been added to the album successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error adding track to album:', error);
      toast({
        title: "Failed to Add Track",
        description: error.message || "Failed to add track to album",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeTrackFromAlbum = async (albumId: string, trackId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to manage album tracks",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('album_tracks')
        .delete()
        .eq('album_id', albumId)
        .eq('track_id', trackId);

      if (error) throw error;

      // Refresh albums to get updated track list
      await fetchAlbums();

      toast({
        title: "Track Removed",
        description: "Track has been removed from the album successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error removing track from album:', error);
      toast({
        title: "Failed to Remove Track",
        description: error.message || "Failed to remove track from album",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderAlbumTracks = async (albumId: string, trackOrders: { trackId: string; trackNumber: number }[]): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to reorder tracks",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Update track numbers in batch
      const updates = trackOrders.map(({ trackId, trackNumber }) =>
        supabase
          .from('album_tracks')
          .update({ track_number: trackNumber })
          .eq('album_id', albumId)
          .eq('track_id', trackId)
      );

      await Promise.all(updates);

      // Refresh albums to get updated track order
      await fetchAlbums();

      toast({
        title: "Tracks Reordered",
        description: "Track order has been updated successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error reordering tracks:', error);
      toast({
        title: "Failed to Reorder",
        description: error.message || "Failed to reorder tracks",
        variant: "destructive",
      });
      return false;
    }
  };

  const publishAlbum = async (albumId: string): Promise<boolean> => {
    return updateAlbum({ id: albumId, is_published: true }) !== null;
  };

  const unpublishAlbum = async (albumId: string): Promise<boolean> => {
    return updateAlbum({ id: albumId, is_published: false }) !== null;
  };

  useEffect(() => {
    fetchAlbums();
  }, [user]);

  return {
    albums,
    loading,
    fetchAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    addTrackToAlbum,
    removeTrackFromAlbum,
    reorderAlbumTracks,
    publishAlbum,
    unpublishAlbum,
  };
};