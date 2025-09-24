-- Fix Security Definer View Issues

-- Drop the problematic views that were created with security definer behavior
DROP VIEW IF EXISTS public.public_event_streams;
DROP VIEW IF EXISTS public.public_venues;

-- Recreate views without security definer behavior - these will respect RLS
CREATE VIEW public.public_event_streams AS
SELECT 
  id,
  event_id,
  is_live,
  viewer_count,
  started_at,
  ended_at,
  stream_url,
  recording_url,
  chat_enabled
FROM public.event_streams;

CREATE VIEW public.public_venues AS
SELECT 
  id,
  name,
  description,
  address,
  city,
  country,
  capacity,
  latitude,
  longitude,
  image_url,
  website_url,
  is_active,
  created_at,
  updated_at
FROM public.venues
WHERE is_active = true;

-- Enable RLS on the views themselves
ALTER VIEW public.public_event_streams SET (security_invoker = on);
ALTER VIEW public.public_venues SET (security_invoker = on);

-- Create RLS policies for the public views to allow public access to safe data
CREATE POLICY "Anyone can view public event streams"
ON public.event_streams
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view public venues" 
ON public.venues
FOR SELECT
TO anon, authenticated  
USING (is_active = true);