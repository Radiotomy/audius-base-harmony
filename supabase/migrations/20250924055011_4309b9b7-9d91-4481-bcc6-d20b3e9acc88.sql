-- Create NFT collections table
CREATE TABLE public.nft_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  symbol text NOT NULL,
  contract_address text,
  network text NOT NULL DEFAULT 'base',
  royalty_percentage numeric DEFAULT 5.0,
  max_supply integer,
  current_supply integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create NFT tokens table
CREATE TABLE public.nft_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.nft_collections(id) ON DELETE CASCADE,
  token_id text NOT NULL,
  track_id text,
  name text NOT NULL,
  description text,
  image_url text,
  metadata_uri text,
  owner_address text NOT NULL,
  creator_address text NOT NULL,
  price numeric,
  is_for_sale boolean DEFAULT false,
  royalty_percentage numeric DEFAULT 5.0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create NFT marketplace listings table
CREATE TABLE public.nft_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id uuid NOT NULL REFERENCES public.nft_tokens(id) ON DELETE CASCADE,
  seller_address text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ETH',
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  sold_at timestamp with time zone,
  buyer_address text
);

-- Create NFT royalty distributions table
CREATE TABLE public.nft_royalties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id uuid NOT NULL REFERENCES public.nft_tokens(id) ON DELETE CASCADE,
  recipient_address text NOT NULL,
  percentage numeric NOT NULL,
  amount_earned numeric DEFAULT 0,
  last_payout_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.nft_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_royalties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for NFT Collections
CREATE POLICY "Artists can manage their own collections" 
ON public.nft_collections 
FOR ALL 
USING (auth.uid() = artist_id);

CREATE POLICY "Anyone can view active collections" 
ON public.nft_collections 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for NFT Tokens
CREATE POLICY "Anyone can view NFT tokens" 
ON public.nft_tokens 
FOR SELECT 
USING (true);

CREATE POLICY "Collection owners can mint tokens" 
ON public.nft_tokens 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nft_collections 
    WHERE id = nft_tokens.collection_id AND artist_id = auth.uid()
  )
);

-- RLS Policies for NFT Listings
CREATE POLICY "Anyone can view active listings" 
ON public.nft_listings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create listings" 
ON public.nft_listings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own listings" 
ON public.nft_listings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for NFT Royalties
CREATE POLICY "Anyone can view royalties" 
ON public.nft_royalties 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create royalties" 
ON public.nft_royalties 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_nft_collections_artist_id ON public.nft_collections(artist_id);
CREATE INDEX idx_nft_tokens_collection_id ON public.nft_tokens(collection_id);
CREATE INDEX idx_nft_tokens_owner_address ON public.nft_tokens(owner_address);
CREATE INDEX idx_nft_listings_token_id ON public.nft_listings(token_id);
CREATE INDEX idx_nft_listings_is_active ON public.nft_listings(is_active);
CREATE INDEX idx_nft_royalties_token_id ON public.nft_royalties(token_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_nft_collections_updated_at
BEFORE UPDATE ON public.nft_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_nft_tokens_updated_at
BEFORE UPDATE ON public.nft_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();