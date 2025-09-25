-- Fix Security Definer View issue by making the view respect RLS
-- Drop the existing view and recreate it with security_invoker = true

DROP VIEW IF EXISTS public.public_venue_info;

-- Create the view with security_invoker = true so it respects RLS policies
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
FROM public.venues
WHERE is_active = true;

-- Grant access to the security-compliant view
GRANT SELECT ON public.public_venue_info TO authenticated, anon;

-- Enable RLS on the view (additional security measure)
ALTER VIEW public.public_venue_info SET (security_invoker = true);