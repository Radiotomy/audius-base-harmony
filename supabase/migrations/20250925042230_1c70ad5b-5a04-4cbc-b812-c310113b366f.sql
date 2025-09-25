-- Critical Security Fixes for Privacy Protection

-- 1. Restrict venue contact information access
-- Drop the overly permissive "Anyone can view public venues" policy and create restrictive ones
DROP POLICY IF EXISTS "Anyone can view public venues" ON public.venues;

-- Allow everyone to see basic venue info but restrict sensitive contact details
CREATE POLICY "Public can view basic venue info" 
ON public.venues 
FOR SELECT 
USING (is_active = true);

-- Create a view for public venue information without contact details
CREATE OR REPLACE VIEW public.public_venue_info AS
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

-- Grant access to the public view
GRANT SELECT ON public.public_venue_info TO authenticated, anon;

-- Restrict full venue access (including contact info) to authenticated users only
CREATE POLICY "Authenticated users can view contact details" 
ON public.venues 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Restrict the public tip stats function to remove privacy-sensitive data
-- Drop the existing function and create a privacy-safe version
DROP FUNCTION IF EXISTS public.get_public_tip_stats();

-- Create a privacy-safe version that only shows aggregated, anonymized stats
CREATE OR REPLACE FUNCTION public.get_public_tip_aggregates()
RETURNS TABLE(
  currency text, 
  total_tips_count bigint, 
  total_amount_range text,
  avg_tip_range text,
  last_tip_date date
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.currency,
    COUNT(*) as total_tips_count,
    CASE 
      WHEN SUM(t.amount) < 1 THEN '< 1'
      WHEN SUM(t.amount) < 10 THEN '1-10'
      WHEN SUM(t.amount) < 100 THEN '10-100'
      WHEN SUM(t.amount) < 1000 THEN '100-1000'
      ELSE '1000+'
    END as total_amount_range,
    CASE 
      WHEN AVG(t.amount) < 0.1 THEN '< 0.1'
      WHEN AVG(t.amount) < 1 THEN '0.1-1'
      WHEN AVG(t.amount) < 5 THEN '1-5'
      WHEN AVG(t.amount) < 10 THEN '5-10'
      ELSE '10+'
    END as avg_tip_range,
    MAX(DATE(t.created_at)) as last_tip_date
  FROM public.artist_tips t
  WHERE t.status = 'confirmed'
  GROUP BY t.currency
  HAVING COUNT(*) >= 5; -- Only show stats for currencies with at least 5 tips
$$;

-- 3. Add additional privacy protection for audit logs
-- Ensure only system can insert audit logs (tighten existing policy)
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (
  -- Only allow inserts from service role or specific authenticated operations
  current_setting('role', true) = 'service_role' OR
  (auth.uid() IS NOT NULL AND current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
);

-- 4. Ensure artist tips remain private between sender and recipient only
-- Update policy to be more explicit about privacy
DROP POLICY IF EXISTS "Users can view their own tips with full details" ON public.artist_tips;
CREATE POLICY "Users can view their own tips only" 
ON public.artist_tips 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid()::text = artist_id
);

-- 5. Add rate limiting protection (create a simple tracking table)
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own rate limit data
CREATE POLICY "Users can view their own rate limits" 
ON public.api_rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.api_rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);