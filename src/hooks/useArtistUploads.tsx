import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ArtistUpload {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  genre: string;
  tags?: string[];
  audio_file_url: string;
  artwork_url?: string;
  duration?: number;
  file_size?: number;
  file_format?: string;
  bit_rate?: number;
  sample_rate?: number;
  license_type?: string;
  is_explicit?: boolean;
  copyright_info?: string;
  status: 'processing' | 'published' | 'draft' | 'failed';
  play_count?: number;
  download_count?: number;
  is_single?: boolean;
  track_number?: number;
  album_id?: string;
  created_at?: string;
  updated_at?: string;
  uploaded_at?: string;
  published_at?: string;
}

export interface CreateUploadData {
  title: string;
  description?: string;
  genre: string;
  tags?: string[];
  audio_file_url: string;
  artwork_url?: string;
  license_type?: string;
  is_explicit?: boolean;
  copyright_info?: string;
  duration?: number;
  file_size?: number;
  file_format?: string;
}

export interface UpdateUploadData {
  id: string;
  title?: string;
  description?: string;
  genre?: string;
  tags?: string[];
  artwork_url?: string;
  license_type?: string;
  is_explicit?: boolean;
  copyright_info?: string;
  status?: ArtistUpload['status'];
}

export const useArtistUploads = () => {
  const [uploads, setUploads] = useState<ArtistUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUploads = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artist_uploads')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUploads((data || []) as ArtistUpload[]);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({
        title: 'Error Loading Tracks',
        description: 'Failed to load your tracks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createUpload = useCallback(async (uploadData: CreateUploadData): Promise<ArtistUpload | null> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to upload tracks.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('artist_uploads')
        .insert({
          artist_id: user.id,
          ...uploadData,
          status: 'processing',
        })
        .select()
        .single();

      if (error) throw error;

      const newUpload = data as ArtistUpload;
      setUploads(prev => [newUpload, ...prev]);

      toast({
        title: 'Track Uploaded Successfully',
        description: `${uploadData.title} has been uploaded and is being processed.`,
      });

      return newUpload;
    } catch (error: any) {
      console.error('Error creating upload:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to save track information.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const updateUpload = useCallback(async (updateData: UpdateUploadData): Promise<ArtistUpload | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('artist_uploads')
        .update(updateData)
        .eq('id', updateData.id)
        .eq('artist_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUpload = data as ArtistUpload;
      setUploads(prev => prev.map(upload => 
        upload.id === updateData.id ? updatedUpload : upload
      ));

      toast({
        title: 'Track Updated',
        description: 'Track information has been updated successfully.',
      });

      return updatedUpload;
    } catch (error: any) {
      console.error('Error updating upload:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update track.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const deleteUpload = useCallback(async (uploadId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('artist_uploads')
        .delete()
        .eq('id', uploadId)
        .eq('artist_id', user.id);

      if (error) throw error;

      setUploads(prev => prev.filter(upload => upload.id !== uploadId));

      toast({
        title: 'Track Deleted',
        description: 'Track has been deleted successfully.',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting upload:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete track.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  const publishUpload = useCallback(async (uploadId: string): Promise<boolean> => {
    const result = await updateUpload({ 
      id: uploadId, 
      status: 'published',
    });
    return result !== null;
  }, [updateUpload]);

  const unpublishUpload = useCallback(async (uploadId: string): Promise<boolean> => {
    const result = await updateUpload({ 
      id: uploadId, 
      status: 'draft',
    });
    return result !== null;
  }, [updateUpload]);

  const getUploadStats = useCallback(() => {
    return {
      total: uploads.length,
      published: uploads.filter(u => u.status === 'published').length,
      draft: uploads.filter(u => u.status === 'draft').length,
      processing: uploads.filter(u => u.status === 'processing').length,
      totalPlays: uploads.reduce((sum, u) => sum + (u.play_count || 0), 0),
      totalDownloads: uploads.reduce((sum, u) => sum + (u.download_count || 0), 0),
    };
  }, [uploads]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  return {
    uploads,
    loading,
    createUpload,
    updateUpload,
    deleteUpload,
    publishUpload,
    unpublishUpload,
    fetchUploads,
    getUploadStats,
  };
};