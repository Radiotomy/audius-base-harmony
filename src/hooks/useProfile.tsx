import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
  // Wallet addresses - only visible to profile owner
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
  totalListeningTime: number; // in minutes
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const targetUserId = userId || user?.id;

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
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
  }, [targetUserId]);

  // Fetch profile statistics
  const fetchStats = useCallback(async () => {
    if (!targetUserId) return;

    try {
      // Fetch all stats in parallel
      const [
        playlistsResult,
        favoritesResult,
        followersResult,
        followingResult,
        tipsResult,
        listeningResult
      ] = await Promise.all([
        supabase
          .from('user_playlists')
          .select('id', { count: 'exact' })
          .eq('user_id', targetUserId),
        
        supabase
          .from('user_favorites')
          .select('id', { count: 'exact' })
          .eq('user_id', targetUserId),
        
        supabase
          .from('user_follows')
          .select('id', { count: 'exact' })
          .eq('following_id', targetUserId),
        
        supabase
          .from('user_follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', targetUserId),
        
        supabase
          .from('artist_tips')
          .select('amount')
          .eq('user_id', targetUserId),
        
        supabase
          .from('user_listening_stats')
          .select('total_listen_time')
          .eq('user_id', targetUserId)
      ]);

      // Calculate total tips amount
      const totalTips = tipsResult.data?.reduce((sum, tip) => sum + parseFloat(tip.amount.toString()), 0) || 0;
      
      // Calculate total listening time in minutes
      const totalListeningTime = Math.round((listeningResult.data?.reduce((sum, stat) => sum + stat.total_listen_time, 0) || 0) / 60);

      setStats({
        totalPlaylists: playlistsResult.count || 0,
        totalFavorites: favoritesResult.count || 0,
        totalFollowers: followersResult.count || 0,
        totalFollowing: followingResult.count || 0,
        totalTips: Math.round(totalTips * 100) / 100, // Round to 2 decimal places
        totalListeningTime
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  }, [targetUserId]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id || user.id !== targetUserId) {
      toast({
        title: "Unauthorized",
        description: "You can only update your own profile",
        variant: "destructive",
      });
      return false;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
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
  }, [user?.id, targetUserId, fetchProfile]);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    if (!user?.id || user.id !== targetUserId) return null;

    setUpdating(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setUpdating(false);
    }
  }, [user?.id, targetUserId, updateProfile]);

  // Search profiles
  const searchProfiles = useCallback(async (query: string, limit: number = 20) => {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, audius_handle')
        .or(`username.ilike.%${query}%,bio.ilike.%${query}%,audius_handle.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchStats();
    }
  }, [targetUserId, fetchProfile, fetchStats]);

  return {
    profile,
    stats,
    loading,
    updating,
    updateProfile,
    uploadAvatar,
    fetchProfile,
    fetchStats,
    searchProfiles,
    isOwnProfile: user?.id === targetUserId,
  };
};