-- Add user_id column to track listing creator
ALTER TABLE public.nft_listings 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Update existing records to set created_by based on seller_address
-- For now, we'll leave existing records with NULL created_by
-- In a real deployment, you'd need to map wallet addresses to user IDs

-- Drop the insecure update policy
DROP POLICY IF EXISTS "Users can manage their own listings" ON public.nft_listings;

-- Create secure policies that only allow listing creators to modify their listings
CREATE POLICY "Only listing creators can update their listings" 
ON public.nft_listings 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Only listing creators can delete their listings" 
ON public.nft_listings 
FOR DELETE 
USING (auth.uid() = created_by);

-- Update the insert policy to automatically set created_by
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.nft_listings;

CREATE POLICY "Authenticated users can create listings" 
ON public.nft_listings 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);