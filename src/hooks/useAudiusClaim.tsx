import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { audiusService } from '@/services/audius';

export interface AudiusClaim {
  id: string;
  user_id: string;
  audius_user_id: string;
  audius_handle: string;
  audius_display_name?: string;
  audius_follower_count: number;
  audius_track_count: number;
  verification_method: 'social_media' | 'email_verification' | 'track_upload';
  verification_data: Record<string, any>;
  claim_status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  last_sync_at?: string;
  sync_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClaimData {
  audius_user_id: string;
  audius_handle: string;
  verification_method: 'social_media' | 'email_verification' | 'track_upload';
  verification_data: Record<string, any>;
}

export const useAudiusClaim = () => {
  const [loading, setLoading] = useState(false);
  const [claim, setClaim] = useState<AudiusClaim | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClaim = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audius_artist_claims' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setClaim(data as unknown as AudiusClaim);
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

  const searchAudiusArtist = useCallback(async (query: string) => {
    try {
      const users = await audiusService.searchUsers(query, 10);
      return users;
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: "Failed to search Audius artists.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const createClaim = useCallback(async (data: CreateClaimData) => {
    if (!user) return;

    try {
      setLoading(true);

      // First, fetch artist data from Audius to verify and get additional info
      const audiusArtist = await audiusService.getUser(data.audius_user_id);
      if (!audiusArtist) {
        throw new Error('Audius artist not found');
      }

      const { data: newClaim, error } = await supabase
        .from('audius_artist_claims' as any)
        .insert({
          user_id: user.id,
          audius_user_id: data.audius_user_id,
          audius_handle: data.audius_handle,
          audius_display_name: audiusArtist.name,
          audius_follower_count: audiusArtist.follower_count || 0,
          audius_track_count: audiusArtist.track_count || 0,
          verification_method: data.verification_method,
          verification_data: data.verification_data,
        })
        .select()
        .single();

      if (error) throw error;

      setClaim(newClaim as unknown as AudiusClaim);
      toast({
        title: "Claim Submitted",
        description: "Your Audius artist claim has been submitted for verification.",
      });

      return newClaim;
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

  const syncWithAudius = useCallback(async () => {
    if (!claim || claim.claim_status !== 'verified') return;

    try {
      setLoading(true);
      const audiusArtist = await audiusService.getUser(claim.audius_user_id);
      
      if (audiusArtist) {
        const { error } = await supabase
          .from('audius_artist_claims' as any)
          .update({
            audius_display_name: audiusArtist.name,
            audius_follower_count: audiusArtist.follower_count || 0,
            audius_track_count: audiusArtist.track_count || 0,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', claim.id);

        if (error) throw error;

        toast({
          title: "Sync Complete",
          description: "Your Audius profile has been synced successfully.",
        });
        
        await fetchClaim(); // Refresh claim data
      }
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [claim, toast, fetchClaim]);

  return {
    claim,
    loading,
    fetchClaim,
    searchAudiusArtist,
    createClaim,
    syncWithAudius,
  };
};