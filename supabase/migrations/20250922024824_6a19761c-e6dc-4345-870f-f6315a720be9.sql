-- Phase 1: Core Database Schema for AudioBASE

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('fan', 'artist', 'admin');

-- User profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    audius_handle TEXT UNIQUE,
    audius_user_id TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'fan',
    UNIQUE(user_id, role)
);

-- Cached Audius tracks
CREATE TABLE public.audius_tracks (
    id TEXT PRIMARY KEY, -- Audius track ID
    title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    artist_id TEXT NOT NULL,
    duration INTEGER,
    play_count INTEGER DEFAULT 0,
    artwork_url TEXT,
    stream_url TEXT,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User favorites
CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    track_id TEXT REFERENCES public.audius_tracks(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- User playlists
CREATE TABLE public.user_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist tracks junction table
CREATE TABLE public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES public.user_playlists(id) ON DELETE CASCADE NOT NULL,
    track_id TEXT REFERENCES public.audius_tracks(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(playlist_id, track_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audius_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" ON public.user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for audius_tracks (public read access)
CREATE POLICY "Anyone can view tracks" ON public.audius_tracks
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tracks" ON public.audius_tracks
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tracks" ON public.audius_tracks
    FOR UPDATE TO authenticated USING (true);

-- RLS Policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_playlists
CREATE POLICY "Users can view public playlists and their own" ON public.user_playlists
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlists" ON public.user_playlists
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for playlist_tracks
CREATE POLICY "Users can view tracks in accessible playlists" ON public.playlist_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_playlists 
            WHERE id = playlist_id 
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage tracks in their own playlists" ON public.playlist_tracks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_playlists 
            WHERE id = playlist_id 
            AND user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON public.user_playlists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON public.audius_tracks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to automatically create user profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'fan');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();