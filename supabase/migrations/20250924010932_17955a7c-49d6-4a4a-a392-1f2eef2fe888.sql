-- Create user following system
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for following
CREATE POLICY "Users can follow others" ON public.user_follows
FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.user_follows
FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Users can view follows" ON public.user_follows
FOR SELECT USING (true);

-- Create activity feed table
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('liked_track', 'created_playlist', 'followed_user', 'tipped_artist')),
  activity_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity feed
CREATE POLICY "Users can create their own activities" ON public.activity_feed
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view activities from followed users" ON public.activity_feed
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_follows 
    WHERE follower_id = auth.uid() AND following_id = user_id
  )
);

-- Create comments table for tracks and playlists
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('track', 'playlist')),
  target_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
FOR DELETE USING (auth.uid() = user_id);

-- Create track ratings table
CREATE TABLE public.track_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Enable RLS
ALTER TABLE public.track_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Anyone can view ratings" ON public.track_ratings
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own ratings" ON public.track_ratings
FOR ALL USING (auth.uid() = user_id);

-- Add collaborative playlist support
ALTER TABLE public.user_playlists 
ADD COLUMN is_collaborative BOOLEAN DEFAULT false,
ADD COLUMN cover_image_url TEXT;

-- Create playlist collaborators table
CREATE TABLE public.playlist_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.user_playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'editor' CHECK (permission_level IN ('editor', 'viewer')),
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, user_id)
);

-- Enable RLS
ALTER TABLE public.playlist_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS policies for collaborators
CREATE POLICY "Playlist owners can manage collaborators" ON public.playlist_collaborators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their collaborations" ON public.playlist_collaborators
FOR SELECT USING (user_id = auth.uid());

-- Create user listening stats table
CREATE TABLE public.user_listening_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  play_count INTEGER NOT NULL DEFAULT 1,
  total_listen_time INTEGER NOT NULL DEFAULT 0, -- in seconds
  last_played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Enable RLS
ALTER TABLE public.user_listening_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for listening stats
CREATE POLICY "Users can view their own stats" ON public.user_listening_stats
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_listening_stats
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON public.activity_feed(created_at DESC);
CREATE INDEX idx_comments_target ON public.comments(target_type, target_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_track_ratings_track ON public.track_ratings(track_id);
CREATE INDEX idx_playlist_collaborators_playlist ON public.playlist_collaborators(playlist_id);
CREATE INDEX idx_listening_stats_user ON public.user_listening_stats(user_id);
CREATE INDEX idx_listening_stats_track ON public.user_listening_stats(track_id);

-- Create trigger for updating comments updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create trigger for updating track_ratings updated_at
CREATE TRIGGER update_track_ratings_updated_at
BEFORE UPDATE ON public.track_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();