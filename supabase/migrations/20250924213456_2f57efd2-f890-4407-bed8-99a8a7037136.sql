-- Add foreign key constraint between events.artist_id and profiles.id
ALTER TABLE public.events 
ADD CONSTRAINT fk_events_artist_id 
FOREIGN KEY (artist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint between events.venue_id and venues.id
ALTER TABLE public.events 
ADD CONSTRAINT fk_events_venue_id 
FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE SET NULL;