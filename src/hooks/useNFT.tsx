import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface NFTCollection {
  id: string;
  artist_id: string;
  name: string;
  description?: string;
  symbol: string;
  contract_address?: string;
  network: string;
  royalty_percentage: number;
  max_supply?: number;
  current_supply: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NFTToken {
  id: string;
  collection_id: string;
  token_id: string;
  track_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  metadata_uri?: string;
  owner_address: string;
  creator_address: string;
  price?: number;
  is_for_sale: boolean;
  royalty_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface NFTListing {
  id: string;
  token_id: string;
  seller_address: string;
  price: number;
  currency: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  sold_at?: string;
  buyer_address?: string;
  created_by?: string;
}

export const useNFTCollections = () => {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nft_collections')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading collections",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (data: Omit<NFTCollection, 'id' | 'artist_id' | 'created_at' | 'updated_at' | 'current_supply'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('nft_collections')
        .insert([{ ...data, artist_id: user.id }]);

      if (error) throw error;
      
      toast({
        title: "Collection created",
        description: "Your NFT collection has been created successfully.",
      });
      
      fetchCollections();
    } catch (error: any) {
      toast({
        title: "Error creating collection",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return {
    collections,
    loading,
    fetchCollections,
    createCollection,
  };
};

export const useNFTTokens = (collectionId?: string) => {
  const [tokens, setTokens] = useState<NFTToken[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTokens = async () => {
    try {
      setLoading(true);
      let query = supabase.from('nft_tokens').select('*');
      
      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading NFTs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const mintToken = async (data: Omit<NFTToken, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('nft_tokens')
        .insert([data]);

      if (error) throw error;
      
      toast({
        title: "NFT minted",
        description: "Your NFT has been minted successfully.",
      });
      
      fetchTokens();
    } catch (error: any) {
      toast({
        title: "Error minting NFT",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [collectionId]);

  return {
    tokens,
    loading,
    fetchTokens,
    mintToken,
  };
};

export const useNFTListings = () => {
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nft_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading marketplace",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (data: Omit<NFTListing, 'id' | 'created_at' | 'sold_at' | 'buyer_address' | 'created_by'>) => {
    try {
      const { error } = await supabase
        .from('nft_listings')
        .insert([{ ...data, created_by: user?.id }]);

      if (error) throw error;
      
      toast({
        title: "NFT listed",
        description: "Your NFT has been listed for sale.",
      });
      
      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error listing NFT",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    fetchListings,
    createListing,
  };
};