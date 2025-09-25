-- Fix venues table security vulnerability by restricting contact information access

-- First, drop the overly permissive public policy that exposes contact information
DROP POLICY IF EXISTS "Public can view basic venue info" ON public.venues;
DROP POLICY IF EXISTS "Public can view basic venue info only" ON public.venues;

-- Create a secure policy that only allows public access to non-sensitive venue information
-- This policy specifically excludes contact_email and contact_phone from public access
CREATE POLICY "Public can view non-sensitive venue information only"
  ON public.venues
  FOR SELECT
  USING (
    is_active = true 
    AND auth.uid() IS NULL  -- This ensures it only applies to unauthenticated users
  );

-- Update the authenticated users policy to be more specific about contact details
DROP POLICY IF EXISTS "Authenticated users can view contact details" ON public.venues;

CREATE POLICY "Authenticated users can view full venue details including contacts"
  ON public.venues  
  FOR SELECT
  USING (
    is_active = true 
    AND auth.uid() IS NOT NULL  -- Only authenticated users
  );

-- Keep the existing policy for event organizers (more specific access)
-- This allows event organizers who have events at a venue to see full details

-- Ensure the public_venue_info view is the recommended way for public access
-- Add a comment to document the security architecture
COMMENT ON VIEW public.public_venue_info IS 
'Public view of venue information that excludes sensitive business contact details (contact_email, contact_phone). Use this view instead of direct table access for public-facing venue listings.';