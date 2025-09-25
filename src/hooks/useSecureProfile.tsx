import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { profileUpdateSchema, validateAndSanitize } from '@/lib/validation';

export const useSecureProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      if (user?.id !== targetUserId) {
        const { data, error } = await supabase
          .rpc('get_public_profile_data', { _profile_id: targetUserId });

        if (error) throw error;
        setProfile(data?.[0] || null);
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

  const updateProfile = useCallback(async (updates: any) => {
    if (!user?.id || user.id !== targetUserId) {
      toast({
        title: "Unauthorized",
        description: "You can only update your own profile",
        variant: "destructive",
      });
      return false;
    }

    const validation = validateAndSanitize(profileUpdateSchema, updates);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(validation.data)
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
    }
  }, [user?.id, targetUserId, fetchProfile]);

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, fetchProfile]);

  return {
    profile,
    loading,
    updateProfile,
    fetchProfile,
    isOwnProfile: user?.id === targetUserId,
  };
};