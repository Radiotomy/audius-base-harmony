-- Create artist tips table to track crypto tips to artists
CREATE TABLE public.artist_tips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id text NOT NULL,
  artist_name text NOT NULL,
  amount numeric(20, 8) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('ETH', 'SOL', 'BASE')),
  transaction_hash text,
  wallet_address text NOT NULL,
  artist_wallet_address text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmed_at timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE public.artist_tips ENABLE ROW LEVEL SECURITY;

-- Users can view their own tips
CREATE POLICY "Users can view their own tips" 
ON public.artist_tips 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own tips
CREATE POLICY "Users can create their own tips" 
ON public.artist_tips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_artist_tips_artist_id ON public.artist_tips(artist_id);
CREATE INDEX idx_artist_tips_user_id ON public.artist_tips(user_id);
CREATE INDEX idx_artist_tips_status ON public.artist_tips(status);