-- CRITICAL SECURITY FIXES: Phase 1 - RLS Policy Updates (Fixed)

-- 1. Fix artist_tips table exposure - restrict financial data to tip creators only
DROP POLICY IF EXISTS "Users can view their own tips" ON public.artist_tips;
DROP POLICY IF EXISTS "Users can create their own tips" ON public.artist_tips;

CREATE POLICY "Users can view their own tips only" 
ON public.artist_tips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tips only" 
ON public.artist_tips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Secure event_tickets table - restrict to purchasers and event organizers
CREATE POLICY "Event owners can view tickets for their events" 
ON public.event_tickets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.events 
  WHERE events.id = event_tickets.event_id 
  AND events.artist_id = auth.uid()
));

-- 3. Protect event_streams data - restrict stream config to event owners
DROP POLICY IF EXISTS "Anyone can view live streams" ON public.event_streams;
DROP POLICY IF EXISTS "Event owners can manage streams" ON public.event_streams;

-- Create secure view for public stream information (without sensitive data)
CREATE OR REPLACE VIEW public.public_event_streams AS
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

-- Allow public access to the safe view
GRANT SELECT ON public.public_event_streams TO anon, authenticated;

-- Restrict full table access to event owners only
CREATE POLICY "Event owners can manage their streams" 
ON public.event_streams 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.events 
  WHERE events.id = event_streams.event_id 
  AND events.artist_id = auth.uid()
));

-- 4. Secure venue contact information - restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view active venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can create venues" ON public.venues;

-- Create public view without contact information
CREATE OR REPLACE VIEW public.public_venues AS
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

-- Allow public access to the safe view
GRANT SELECT ON public.public_venues TO anon, authenticated;

-- Restrict full table (including contact info) to authenticated users only
CREATE POLICY "Authenticated users can view venues with contact info" 
ON public.venues 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Authenticated users can create venues" 
ON public.venues 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role::text = _role
  );
$$;

-- 6. Secure user_roles table against role escalation
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create admin policy for role management (admins can manage all roles)
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));