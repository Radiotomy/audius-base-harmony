-- Create wallet_bindings table for Web3 authentication
CREATE TABLE public.wallet_bindings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('ethereum', 'solana')),
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address)
);

-- Enable Row Level Security
ALTER TABLE public.wallet_bindings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own wallet bindings" 
ON public.wallet_bindings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet bindings" 
ON public.wallet_bindings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet bindings" 
ON public.wallet_bindings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallet bindings" 
ON public.wallet_bindings 
FOR DELETE 
USING (auth.uid() = user_id);