import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  audius_handle?: string;
}

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: 'liked_track' | 'created_playlist' | 'followed_user' | 'tipped_artist';
  activity_data: any;
  created_at: string;
  user?: UserProfile;
}

interface Comment {
  id: string;
  user_id: string;
  target_type: 'track' | 'playlist';
  target_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  replies?: Comment[];
}

export const useSocial = () => {
  const { user } = useAuth();
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch following list
  const fetchFollowing = useCallback(async (userId?: string) => {
    if (!userId && !user?.id) return;
    
    const targetUserId = userId || user!.id;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', targetUserId);

      if (error) throw error;

      if (data && data.length > 0) {
        const followingIds = data.map(item => item.following_id);
        
        // Fetch profiles for following users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, bio, audius_handle')
          .in('id', followingIds);

        if (profilesError) throw profilesError;
        
        setFollowing(profiles || []);
      } else {
        setFollowing([]);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      toast({
        title: "Error",
        description: "Failed to load following list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch followers list
  const fetchFollowers = useCallback(async (userId?: string) => {
    if (!userId && !user?.id) return;
    
    const targetUserId = userId || user!.id;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', targetUserId);

      if (error) throw error;

      if (data && data.length > 0) {
        const followerIds = data.map(item => item.follower_id);
        
        // Fetch profiles for follower users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, bio, audius_handle')
          .in('id', followerIds);

        if (profilesError) throw profilesError;
        
        setFollowers(profiles || []);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast({
        title: "Error",
        description: "Failed to load followers list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Follow a user
  const followUser = useCallback(async (targetUserId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (error) throw error;

      // Add activity to feed
      await supabase
        .from('activity_feed')
        .insert({
          user_id: user.id,
          activity_type: 'followed_user',
          activity_data: { target_user_id: targetUserId }
        });

      await fetchFollowing();
      toast({
        title: "Success",
        description: "User followed successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error following user:', error);
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Already Following",
          description: "You're already following this user",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to follow user",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [user?.id, fetchFollowing]);

  // Unfollow a user
  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

      await fetchFollowing();
      toast({
        title: "Success",
        description: "User unfollowed successfully",
      });
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, fetchFollowing]);

  // Check if following a user
  const isFollowing = useCallback((targetUserId: string) => {
    return following.some(f => f.id === targetUserId);
  }, [following]);

  // Fetch activity feed
  const fetchActivityFeed = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(item => item.user_id))];
        
        // Fetch profiles for activity users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, bio, audius_handle')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Map profiles to activities
        const profileMap = new Map();
        profiles?.forEach(profile => {
          profileMap.set(profile.id, profile);
        });

        const activitiesWithProfiles = data.map(activity => ({
          ...activity,
          activity_type: activity.activity_type as ActivityItem['activity_type'],
          user: profileMap.get(activity.user_id)
        }));

        setActivityFeed(activitiesWithProfiles);
      } else {
        setActivityFeed([]);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      toast({
        title: "Error",
        description: "Failed to load activity feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Add activity
  const addActivity = useCallback(async (
    activityType: ActivityItem['activity_type'],
    activityData: any
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData
        });

      if (error) throw error;
      
      await fetchActivityFeed();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }, [user?.id, fetchActivityFeed]);

  // Initialize data on mount
  useEffect(() => {
    if (user?.id) {
      fetchFollowing();
      fetchFollowers();
      fetchActivityFeed();
    }
  }, [user?.id, fetchFollowing, fetchFollowers, fetchActivityFeed]);

  return {
    following,
    followers,
    activityFeed,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    fetchFollowing,
    fetchFollowers,
    fetchActivityFeed,
    addActivity,
  };
};