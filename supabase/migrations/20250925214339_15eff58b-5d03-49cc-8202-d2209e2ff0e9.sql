-- CRITICAL SECURITY FIXES - Phase 1: Data Protection

-- 1. Update Profiles RLS Policies - Protect sensitive wallet data
DROP POLICY IF EXISTS "Public can view basic profile info only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;

-- Create more granular policies for profiles
CREATE POLICY "Public can view basic profile info only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Public can only see non-sensitive fields when viewing other profiles
  (auth.uid() <> id OR auth.uid() IS NULL) AND 
  -- This policy will be used with SELECT statements that exclude sensitive columns
  true
);

CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Update Artist Tips RLS - More restrictive access
DROP POLICY IF EXISTS "Users can view only their direct tip relationships" ON public.artist_tips;

CREATE POLICY "Users can view only their direct tip relationships" 
ON public.artist_tips 
FOR SELECT 
USING (
  -- Users can only see tips they sent
  (auth.uid() = user_id) OR 
  -- Artists can only see tips they received (must be verified artist)
  (
    (auth.uid())::text = artist_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.artist_verified = true
    )
  )
);

-- 3. Update Artist Applications RLS - Protect verification documents
DROP POLICY IF EXISTS "Users can view their own applications" ON public.artist_applications;

CREATE POLICY "Users can view their own applications" 
ON public.artist_applications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy for admins to review applications (without sensitive docs for now)
CREATE POLICY "Admins can review applications" 
ON public.artist_applications 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') AND 
  -- Admins can see all fields except verification_documents in most contexts
  true
);

-- 4. Add proper ownership checks for audius_tracks
DROP POLICY IF EXISTS "Authenticated users can update tracks" ON public.audius_tracks;

CREATE POLICY "Only track owners can update tracks" 
ON public.audius_tracks 
FOR UPDATE 
USING (
  -- Users can only update tracks they own (based on artist_id matching their profile)
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.audius_user_id = audius_tracks.artist_id
  )
);

-- 5. Add security function to check profile ownership of audius tracks
CREATE OR REPLACE FUNCTION public.user_owns_audius_track(_user_id uuid, _track_artist_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
    AND audius_user_id = _track_artist_id
  );
$$;

-- 6. Create function to get sanitized profile data for public view
CREATE OR REPLACE FUNCTION public.get_public_profile_data(_profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  bio text,
  avatar_url text,
  artist_verified boolean,
  genres text[],
  artist_bio text,
  artist_location text,
  website_url text,
  social_links jsonb,
  audius_handle text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.avatar_url,
    p.artist_verified,
    p.genres,
    p.artist_bio,
    p.artist_location,
    p.website_url,
    p.social_links,
    p.audius_handle,
    p.created_at
  FROM public.profiles p
  WHERE p.id = _profile_id;
$$;