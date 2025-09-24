-- Create storage buckets for artist content
INSERT INTO storage.buckets (id, name, public) VALUES
('artist-tracks', 'artist-tracks', false),
('cover-art', 'cover-art', true),
('profile-media', 'profile-media', true),
('merch-images', 'merch-images', true);

-- Create RLS policies for artist-tracks bucket (private audio files)
CREATE POLICY "Artists can upload their own tracks" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'artist-tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can view their own tracks" ON storage.objects
FOR SELECT USING (
  bucket_id = 'artist-tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can update their own tracks" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'artist-tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can delete their own tracks" ON storage.objects
FOR DELETE USING (
  bucket_id = 'artist-tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for cover-art bucket (public images)
CREATE POLICY "Anyone can view cover art" ON storage.objects
FOR SELECT USING (bucket_id = 'cover-art');

CREATE POLICY "Artists can upload cover art" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cover-art' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can update their cover art" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'cover-art' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can delete their cover art" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cover-art' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for profile-media bucket (public profile images)
CREATE POLICY "Anyone can view profile media" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-media');

CREATE POLICY "Users can upload their profile media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their profile media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their profile media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for merch-images bucket (public merchandise images)
CREATE POLICY "Anyone can view merch images" ON storage.objects
FOR SELECT USING (bucket_id = 'merch-images');

CREATE POLICY "Artists can upload merch images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'merch-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can update their merch images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'merch-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can delete their merch images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'merch-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create albums table for organizing tracks
CREATE TABLE public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_art_url text,
  release_date date,
  album_type text NOT NULL DEFAULT 'album' CHECK (album_type IN ('single', 'ep', 'album')),
  genre text NOT NULL,
  tags text[],
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on albums
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for albums
CREATE POLICY "Anyone can view published albums" ON public.albums
FOR SELECT USING (is_published = true);

CREATE POLICY "Artists can manage their own albums" ON public.albums
FOR ALL USING (auth.uid() = artist_id);

-- Create album_tracks junction table
CREATE TABLE public.album_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.artist_uploads(id) ON DELETE CASCADE,
  track_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(album_id, track_number),
  UNIQUE(album_id, track_id)
);

-- Enable RLS on album_tracks
ALTER TABLE public.album_tracks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for album_tracks
CREATE POLICY "Anyone can view published album tracks" ON public.album_tracks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_tracks.album_id AND albums.is_published = true
  )
);

CREATE POLICY "Artists can manage their album tracks" ON public.album_tracks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_tracks.album_id AND albums.artist_id = auth.uid()
  )
);

-- Create merchandise items table
CREATE TABLE public.merch_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price > 0),
  currency text NOT NULL DEFAULT 'ETH',
  category text NOT NULL CHECK (category IN ('clothing', 'accessories', 'vinyl', 'digital', 'other')),
  images text[] DEFAULT '{}',
  inventory_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on merch_items
ALTER TABLE public.merch_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for merch_items
CREATE POLICY "Anyone can view active merch items" ON public.merch_items
FOR SELECT USING (is_active = true);

CREATE POLICY "Artists can manage their own merch" ON public.merch_items
FOR ALL USING (auth.uid() = artist_id);

-- Create merch orders table
CREATE TABLE public.merch_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merch_item_id uuid NOT NULL REFERENCES public.merch_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb,
  transaction_hash text,
  payment_confirmed_at timestamp with time zone,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on merch_orders
ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for merch_orders
CREATE POLICY "Buyers can view their own orders" ON public.merch_orders
FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Artists can view orders for their merch" ON public.merch_orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.merch_items 
    WHERE merch_items.id = merch_orders.merch_item_id AND merch_items.artist_id = auth.uid()
  )
);

CREATE POLICY "Buyers can create orders" ON public.merch_orders
FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Artists can update orders for their merch" ON public.merch_orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.merch_items 
    WHERE merch_items.id = merch_orders.merch_item_id AND merch_items.artist_id = auth.uid()
  )
);

-- Create artist revenue tracking table
CREATE TABLE public.artist_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revenue_type text NOT NULL CHECK (revenue_type IN ('tips', 'nft_sales', 'merch_sales', 'royalties')),
  source_id text, -- references the source transaction/item
  amount numeric NOT NULL,
  currency text NOT NULL,
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  recorded_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on artist_revenue
ALTER TABLE public.artist_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for artist_revenue
CREATE POLICY "Artists can view their own revenue" ON public.artist_revenue
FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "System can insert revenue records" ON public.artist_revenue
FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_merch_items_updated_at
  BEFORE UPDATE ON public.merch_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_merch_orders_updated_at
  BEFORE UPDATE ON public.merch_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Update artist_uploads table with better organization
ALTER TABLE public.artist_uploads ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL;
ALTER TABLE public.artist_uploads ADD COLUMN IF NOT EXISTS track_number integer;
ALTER TABLE public.artist_uploads ADD COLUMN IF NOT EXISTS is_single boolean DEFAULT false;