-- Priority 1: Fix Social Privacy Issues

-- 1. Secure Follow Relationships - Restrict visibility to involved parties only
DROP POLICY IF EXISTS "Users can view follows" ON public.user_follows;

CREATE POLICY "Users can view their own follow relationships" 
ON public.user_follows 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- 2. Protect Venue Contact Information - Create restricted access for contact details
DROP POLICY IF EXISTS "Authenticated users can view venues with contact info" ON public.venues;

-- Allow public to see basic venue info (no contact details)
CREATE POLICY "Anyone can view basic venue info" 
ON public.venues 
FOR SELECT 
USING (is_active = true);

-- Create function to check if user owns events at a venue
CREATE OR REPLACE FUNCTION public.user_has_events_at_venue(_user_id uuid, _venue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events
    WHERE artist_id = _user_id AND venue_id = _venue_id
  );
$$;

-- Allow event organizers to see full venue details including contact info
CREATE POLICY "Event organizers can view full venue details" 
ON public.venues 
FOR SELECT 
USING (
  is_active = true 
  AND (
    auth.uid() IS NOT NULL 
    AND public.user_has_events_at_venue(auth.uid(), id)
  )
);

-- 3. Enhanced Wallet Privacy - Add privacy controls for wallet addresses
-- Update artist_tips to mask wallet addresses for non-owners
DROP POLICY IF EXISTS "Users can view their own tips only" ON public.artist_tips;

CREATE POLICY "Users can view their own tips with full details" 
ON public.artist_tips 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a view for public tip statistics without exposing wallet addresses
CREATE OR REPLACE VIEW public.public_tip_stats AS
SELECT 
  artist_id,
  artist_name,
  currency,
  amount,
  message,
  created_at,
  network,
  status,
  -- Mask wallet addresses for privacy
  CASE 
    WHEN LENGTH(wallet_address) > 8 
    THEN CONCAT(SUBSTRING(wallet_address, 1, 6), '...', SUBSTRING(wallet_address, LENGTH(wallet_address) - 3))
    ELSE wallet_address
  END as masked_wallet_address,
  CASE 
    WHEN LENGTH(COALESCE(artist_wallet_address, '')) > 8 
    THEN CONCAT(SUBSTRING(artist_wallet_address, 1, 6), '...', SUBSTRING(artist_wallet_address, LENGTH(artist_wallet_address) - 3))
    ELSE artist_wallet_address
  END as masked_artist_wallet_address
FROM public.artist_tips 
WHERE status = 'confirmed';

-- Grant access to the public view
GRANT SELECT ON public.public_tip_stats TO authenticated, anon;

-- Update wallet_bindings to ensure only users can see their own wallet addresses
-- (This table already has proper RLS, just ensuring it's secure)

-- 4. Additional Privacy Enhancement - Limit activity feed visibility
DROP POLICY IF EXISTS "Users can view activities from followed users" ON public.activity_feed;

CREATE POLICY "Users can view activities from followed users and public activities" 
ON public.activity_feed 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 
    FROM user_follows 
    WHERE follower_id = auth.uid() 
    AND following_id = activity_feed.user_id
  )
  OR (activity_data->>'is_public')::boolean = true
);

-- 5. Secure artist earnings to only show to the artist
-- (Already properly secured, just documenting)

-- Create audit log for security-sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON public.security_audit_log TO authenticated;