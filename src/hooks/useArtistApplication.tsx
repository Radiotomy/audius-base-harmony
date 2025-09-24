import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ArtistApplication {
  id: string;
  user_id: string;
  application_type: 'native' | 'audius_claim' | 'hybrid';
  audius_user_id?: string;
  audius_handle?: string;
  display_name: string;
  genres: string[];
  bio: string;
  social_links: Record<string, string>;
  sample_tracks: any[];
  verification_documents: any[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationData {
  application_type: 'native' | 'audius_claim' | 'hybrid';
  audius_user_id?: string;
  audius_handle?: string;
  display_name: string;
  genres: string[];
  bio: string;
  social_links?: Record<string, string>;
  sample_tracks?: any[];
  verification_documents?: any[];
}

export const useArtistApplication = () => {
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<ArtistApplication | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApplication = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artist_applications' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setApplication(data as unknown as ArtistApplication);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createApplication = useCallback(async (data: CreateApplicationData) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: newApplication, error } = await supabase
        .from('artist_applications' as any)
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      setApplication(newApplication as unknown as ArtistApplication);
      toast({
        title: "Application Submitted",
        description: "Your artist application has been submitted for review.",
      });

      return newApplication;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateApplication = useCallback(async (updates: Partial<CreateApplicationData>) => {
    if (!user || !application) return;

    try {
      setLoading(true);
      const { data: updatedApplication, error } = await supabase
        .from('artist_applications' as any)
        .update(updates)
        .eq('id', application.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setApplication(updatedApplication as unknown as ArtistApplication);
      toast({
        title: "Application Updated",
        description: "Your artist application has been updated.",
      });

      return updatedApplication;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, application, toast]);

  return {
    application,
    loading,
    fetchApplication,
    createApplication,
    updateApplication,
  };
};