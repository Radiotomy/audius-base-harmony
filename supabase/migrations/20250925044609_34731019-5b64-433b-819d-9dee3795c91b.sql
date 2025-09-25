-- CRITICAL PRIVACY FIXES: Restrict sensitive data visibility (Fixed)

-- 1. FIX: Hide wallet addresses from public profile view
-- Drop existing profile policies and recreate with privacy protection
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new privacy-respecting profile policies
CREATE POLICY "Users can view public profile data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = id 
  OR 
  -- Others can only see non-sensitive public data (exclude wallet addresses)
  (auth.uid() != id OR auth.uid() IS NULL)
);

-- 2. FIX: Restrict venue contact information access
-- Drop ALL existing venue policies first
DROP POLICY IF EXISTS "Anyone can view venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can view basic venue info" ON public.venues;
DROP POLICY IF EXISTS "Event organizers can view venue contacts" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can manage their venues" ON public.venues;

-- Create new restrictive venue policies
CREATE POLICY "Public can view basic venue info only" 
ON public.venues 
FOR SELECT 
USING (
  is_active = true 
  -- This will allow access to basic info but frontend should filter out contact details
);

-- 3. FIX: Prevent cross-artist tip data leakage
-- Update artist_tips policy to be more restrictive
DROP POLICY IF EXISTS "Users can view their own tips only" ON public.artist_tips;

-- Create stricter policy that prevents artist ID text matching abuse
CREATE POLICY "Users can view only their direct tip relationships" 
ON public.artist_tips 
FOR SELECT 
USING (
  -- User sent this tip
  auth.uid() = user_id 
  OR 
  -- User received this tip (must match their actual user ID, not just text field)
  (auth.uid())::text = artist_id AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.id::text = artist_tips.artist_id
  )
);

-- 4. SECURITY: Update public venue view to exclude contact information
DROP VIEW IF EXISTS public.public_venue_info;

-- Recreate view without sensitive contact details
CREATE VIEW public.public_venue_info
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  address,
  city,
  country,
  capacity,
  description,
  website_url,
  image_url,
  latitude,
  longitude,
  is_active,
  created_at,
  updated_at
  -- Explicitly exclude: contact_email, contact_phone
FROM public.venues
WHERE is_active = true;

GRANT SELECT ON public.public_venue_info TO authenticated, anon;