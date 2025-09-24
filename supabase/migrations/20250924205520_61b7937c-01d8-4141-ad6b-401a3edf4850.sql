-- Fix Security Definer View Issue - Use a function approach instead

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_tip_stats;

-- Create a function to get public tip statistics with masked addresses
CREATE OR REPLACE FUNCTION public.get_public_tip_stats()
RETURNS TABLE (
  artist_id text,
  artist_name text,
  currency text,
  amount numeric,
  message text,
  created_at timestamp with time zone,
  network text,
  status text,
  masked_wallet_address text,
  masked_artist_wallet_address text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    t.artist_id,
    t.artist_name,
    t.currency,
    t.amount,
    t.message,
    t.created_at,
    t.network,
    t.status,
    -- Mask wallet addresses for privacy
    CASE 
      WHEN LENGTH(t.wallet_address) > 8 
      THEN CONCAT(SUBSTRING(t.wallet_address, 1, 6), '...', SUBSTRING(t.wallet_address, LENGTH(t.wallet_address) - 3))
      ELSE t.wallet_address
    END as masked_wallet_address,
    CASE 
      WHEN LENGTH(COALESCE(t.artist_wallet_address, '')) > 8 
      THEN CONCAT(SUBSTRING(t.artist_wallet_address, 1, 6), '...', SUBSTRING(t.artist_wallet_address, LENGTH(t.artist_wallet_address) - 3))
      ELSE t.artist_wallet_address
    END as masked_artist_wallet_address
  FROM public.artist_tips t
  WHERE t.status = 'confirmed';
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_public_tip_stats() TO authenticated, anon;