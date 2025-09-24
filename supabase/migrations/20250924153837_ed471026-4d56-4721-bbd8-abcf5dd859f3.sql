-- Create events platform database schema

-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  capacity INTEGER,
  latitude DECIMAL,
  longitude DECIMAL,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  artist_id UUID NOT NULL,
  venue_id UUID,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  door_time TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  ticket_price DECIMAL DEFAULT 0,
  max_capacity INTEGER,
  current_attendance INTEGER DEFAULT 0,
  event_type TEXT NOT NULL DEFAULT 'concert', -- concert, festival, virtual, etc.
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
  is_virtual BOOLEAN DEFAULT false,
  stream_url TEXT,
  cover_image_url TEXT,
  genre TEXT,
  age_restriction TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event tickets table
CREATE TABLE public.event_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  ticket_type TEXT NOT NULL DEFAULT 'general', -- general, vip, backstage, etc.
  price DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETH',
  purchase_hash TEXT,
  ticket_number TEXT UNIQUE,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'valid', -- valid, used, refunded, transferred
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create event streams table for live streaming
CREATE TABLE public.event_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  stream_url TEXT,
  backup_stream_url TEXT,
  is_live BOOLEAN DEFAULT false,
  viewer_count INTEGER DEFAULT 0,
  max_viewers INTEGER DEFAULT 0,
  stream_key TEXT,
  chat_enabled BOOLEAN DEFAULT true,
  recording_enabled BOOLEAN DEFAULT false,
  recording_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.events ADD CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES public.venues(id);
ALTER TABLE public.event_tickets ADD CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE public.event_streams ADD CONSTRAINT fk_streams_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_streams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for venues
CREATE POLICY "Anyone can view active venues" 
ON public.venues FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create venues" 
ON public.venues FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for events
CREATE POLICY "Anyone can view events" 
ON public.events FOR SELECT 
USING (true);

CREATE POLICY "Artists can create their own events" 
ON public.events FOR INSERT 
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own events" 
ON public.events FOR UPDATE 
USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own events" 
ON public.events FOR DELETE 
USING (auth.uid() = artist_id);

-- Create RLS policies for event tickets
CREATE POLICY "Users can view their own tickets" 
ON public.event_tickets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase tickets" 
ON public.event_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
ON public.event_tickets FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for event streams
CREATE POLICY "Anyone can view live streams" 
ON public.event_streams FOR SELECT 
USING (true);

CREATE POLICY "Event owners can manage streams" 
ON public.event_streams FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.events 
  WHERE events.id = event_streams.event_id 
  AND events.artist_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_events_artist_id ON public.events(artist_id);
CREATE INDEX idx_events_venue_id ON public.events(venue_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_event_tickets_event_id ON public.event_tickets(event_id);
CREATE INDEX idx_event_tickets_user_id ON public.event_tickets(user_id);
CREATE INDEX idx_venues_city ON public.venues(city);

-- Create updated_at triggers
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();