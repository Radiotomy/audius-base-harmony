import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { profileUpdateSchema, validateAndSanitize } from '@/lib/validation';

interface UserProfile {
  id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  audius_handle?: string;
  audius_user_id?: string;
  artist_verified?: boolean;
  artist_registration_type?: string;
  audius_verified?: boolean;
  genres?: string[];
  social_links?: any;
  artist_bio?: string;
  artist_location?: string;
  website_url?: string;
  verified_at?: string;
  verification_status?: string;
  wallet_address?: string;
  base_wallet_address?: string;
  preferred_tip_currency?: string;
  tip_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileStats {
  totalPlaylists: number;
  totalFavorites: number;
  totalFollowers: number;
  totalFollowing: number;
  totalTips: number;
  totalListeningTime: number;
}

export const useProfileFixed = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      if (user?.id !== targetUserId) {
        const { data, error } = await supabase
          .rpc('get_public_profile_data', { _profile_id: targetUserId });

        if (error) throw error;
        
        if (data && data[0]) {
          setProfile({
            ...data[0],
            updated_at: data[0].created_at || new Date().toISOString()
          });
        } else {
          setProfile(null);
        }
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [targetUserId, user?.id]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id || user.id !== targetUserId) {
      toast({
        title: "Unauthorized",
        description: "You can only update your own profile",
        variant: "destructive",
      });
      return false;
    }

    const validation = validateAndSanitize(profileUpdateSchema, updates);
    
    if (validation.success) {
      setUpdating(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...validation.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        await fetchProfile();
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        return true;
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return false;
      } finally {
        setUpdating(false);
      }
    } else {
      const errorResult = validation as { success: false; errors: string[] };
      toast({
        title: "Validation Error",
        description: errorResult.errors.join(', '),
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, targetUserId, fetchProfile]);

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, fetchProfile]);

  return {
    profile,
    stats,
    loading,
    updating,
    updateProfile,
    fetchProfile,
    isOwnProfile: user?.id === targetUserId,
  };
};