-- Add wallet address to profiles for artist payouts
ALTER TABLE public.profiles 
ADD COLUMN wallet_address TEXT,
ADD COLUMN base_wallet_address TEXT,
ADD COLUMN preferred_tip_currency TEXT DEFAULT 'ETH',
ADD COLUMN tip_enabled BOOLEAN DEFAULT true;

-- Create artist earnings tracking table
CREATE TABLE public.artist_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  tip_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.artist_earnings ENABLE ROW LEVEL SECURITY;

-- RLS policies for artist earnings
CREATE POLICY "Artists can view their own earnings" 
ON public.artist_earnings 
FOR SELECT 
USING (auth.uid() = artist_id);

CREATE POLICY "System can insert earnings" 
ON public.artist_earnings 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraint
ALTER TABLE public.artist_earnings
ADD CONSTRAINT artist_earnings_tip_id_fkey 
FOREIGN KEY (tip_id) REFERENCES public.artist_tips(id);

-- Create index for performance
CREATE INDEX idx_artist_earnings_artist_id ON public.artist_earnings(artist_id);
CREATE INDEX idx_artist_earnings_status ON public.artist_earnings(status);

-- Update artist_tips table to support enhanced features
ALTER TABLE public.artist_tips
ADD COLUMN gas_sponsored BOOLEAN DEFAULT false,
ADD COLUMN network TEXT DEFAULT 'base',
ADD COLUMN usd_value NUMERIC,
ADD COLUMN artist_earnings_id UUID;

-- Add foreign key for earnings tracking
ALTER TABLE public.artist_tips
ADD CONSTRAINT artist_tips_earnings_fkey 
FOREIGN KEY (artist_earnings_id) REFERENCES public.artist_earnings(id);