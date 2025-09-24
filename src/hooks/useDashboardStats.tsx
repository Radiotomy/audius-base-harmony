import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DashboardStats {
  trackCount: number;
  albumCount: number;
  followerCount: number;
  totalPlays: number;
  publishedTracks: number;
  draftTracks: number;
  processingTracks: number;
  totalEarnings: number;
  thisWeekPlays: number;
  thisWeekEarnings: number;
}

export interface RecentActivity {
  id: string;
  type: 'upload' | 'tip' | 'follow' | 'play' | 'album_create';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    trackCount: 0,
    albumCount: 0,
    followerCount: 0,
    totalPlays: 0,
    publishedTracks: 0,
    draftTracks: 0,
    processingTracks: 0,
    totalEarnings: 0,
    thisWeekPlays: 0,
    thisWeekEarnings: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch artist uploads stats
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('artist_uploads')
        .select('status, play_count, created_at')
        .eq('artist_id', user.id);

      if (uploadsError) throw uploadsError;

      // Fetch albums count
      const { count: albumCount, error: albumError } = await supabase
        .from('albums')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', user.id);

      if (albumError) throw albumError;

      // Fetch follower count
      const { count: followerCount, error: followError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      if (followError) throw followError;

      // Fetch earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('artist_tips')
        .select('amount, usd_value, created_at')
        .eq('artist_id', user.id)
        .eq('status', 'confirmed');

      if (earningsError) throw earningsError;

      // Calculate stats
      const uploads = uploadsData || [];
      const earnings = earningsData || [];
      
      const totalPlays = uploads.reduce((sum, upload) => sum + (upload.play_count || 0), 0);
      const totalEarnings = earnings.reduce((sum, tip) => sum + (tip.usd_value || 0), 0);

      // This week calculations
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const thisWeekEarnings = earnings
        .filter(tip => new Date(tip.created_at) >= oneWeekAgo)
        .reduce((sum, tip) => sum + (tip.usd_value || 0), 0);

      const publishedTracks = uploads.filter(u => u.status === 'published').length;
      const draftTracks = uploads.filter(u => u.status === 'draft').length;
      const processingTracks = uploads.filter(u => u.status === 'processing').length;

      setStats({
        trackCount: uploads.length,
        albumCount: albumCount || 0,
        followerCount: followerCount || 0,
        totalPlays,
        publishedTracks,
        draftTracks,
        processingTracks,
        totalEarnings,
        thisWeekPlays: 0, // Would need play tracking data
        thisWeekEarnings,
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentActivity = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch recent activity from activity_feed table
      const { data: activityData, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedActivity: RecentActivity[] = (activityData || []).map(activity => {
        const activityData = activity.activity_data as any;
        return {
          id: activity.id,
          type: activity.activity_type as RecentActivity['type'],
          title: activityData?.title || 'Activity',
          description: activityData?.description || '',
          timestamp: activity.created_at,
          metadata: activityData || {},
        };
      });

      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }, [user]);

  const addActivity = useCallback(async (
    type: RecentActivity['type'],
    title: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: user.id,
          activity_type: type,
          activity_data: {
            title,
            description,
            ...metadata,
            is_public: false, // Artist activities are private by default
          },
        });

      if (error) throw error;

      // Refresh activity feed
      fetchRecentActivity();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }, [user, fetchRecentActivity]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, [fetchStats, fetchRecentActivity]);

  return {
    stats,
    recentActivity,
    loading,
    refreshStats: fetchStats,
    refreshActivity: fetchRecentActivity,
    addActivity,
  };
};