import { useState } from 'react';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { useSolana } from '@/contexts/SolanaContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

interface TipParams {
  artistId: string;
  artistName: string;
  amount: number;
  currency: 'ETH' | 'SOL' | 'BASE';
  message?: string;
}

interface TipRecord {
  id: string;
  artist_id: string;
  artist_name: string;
  amount: number;
  currency: string;
  transaction_hash?: string | null;
  message?: string | null;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  confirmed_at?: string | null;
}

export const useTipping = () => {
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<TipRecord[]>([]);
  const { user } = useAuth();
  const { address } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const solana = useSolana();
  const { toast } = useToast();

  // Default artist wallet addresses (in a real app, these would be fetched from artist profiles)
  const getArtistWallet = (artistId: string, currency: 'ETH' | 'SOL') => {
    // Placeholder wallet addresses - in production, these would be stored in the database
    const ethWallet = '0x742d35Cc6634C0532925a3b8D373d3E2B2dA4e9D'; // Example wallet
    const solWallet = 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W'; // Example wallet
    
    return currency === 'ETH' ? ethWallet : solWallet;
  };

  const saveTipToDatabase = async (params: TipParams & { 
    transactionHash?: string;
    walletAddress: string;
    status?: 'pending' | 'confirmed' | 'failed';
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('artist_tips')
        .insert({
          user_id: user.id,
          artist_id: params.artistId,
          artist_name: params.artistName,
          amount: params.amount,
          currency: params.currency,
          transaction_hash: params.transactionHash,
          wallet_address: params.walletAddress,
          artist_wallet_address: getArtistWallet(params.artistId, params.currency as 'ETH' | 'SOL'),
          message: params.message,
          status: params.status || 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to save tip to database:', error);
      return null;
    }
  };

  const tipArtistETH = async (params: TipParams) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Ethereum wallet first",
        variant: "destructive",
      });
      return false;
    }

    try {
      const artistWallet = getArtistWallet(params.artistId, 'ETH');
      
      // Save pending tip to database
      const tipRecord = await saveTipToDatabase({
        ...params,
        walletAddress: address,
        status: 'pending',
      });

      // Send transaction
      await sendTransaction({
        to: artistWallet as `0x${string}`,
        value: parseEther(params.amount.toString()),
      });

      // Update tip record as confirmed (transaction hash would be available via events in production)
      if (tipRecord) {
        await supabase
          .from('artist_tips')
          .update({ 
            transaction_hash: `eth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'confirmed' 
          })
          .eq('id', tipRecord.id);
      }

      return true;
    } catch (error: any) {
      console.error('ETH tip failed:', error);
      
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send ETH tip",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const tipArtistSOL = async (params: TipParams) => {
    if (!solana.connected || !solana.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Solana wallet first",
        variant: "destructive",
      });
      return false;
    }

    try {
      const artistWallet = getArtistWallet(params.artistId, 'SOL');
      
      // Save pending tip to database
      const tipRecord = await saveTipToDatabase({
        ...params,
        walletAddress: solana.publicKey.toString(),
        status: 'pending',
      });

      // For now, simulate Solana transaction
      // In production, you would implement actual Solana transaction logic
      toast({
        title: "Solana Tipping",
        description: "Solana tipping is coming soon! This is a demo.",
      });

      // Simulate successful transaction
      const simulatedTxHash = `sol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update tip record with simulated transaction hash
      if (tipRecord) {
        await supabase
          .from('artist_tips')
          .update({ 
            transaction_hash: simulatedTxHash,
            status: 'confirmed'
          })
          .eq('id', tipRecord.id);
      }

      return true;
    } catch (error: any) {
      console.error('SOL tip failed:', error);
      
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send SOL tip",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const tipArtist = async (params: TipParams) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to tip artists",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    
    try {
      let success = false;
      
      if (params.currency === 'ETH' || params.currency === 'BASE') {
        success = await tipArtistETH(params);
      } else if (params.currency === 'SOL') {
        success = await tipArtistSOL(params);
      }
      
      return success;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTips = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('artist_tips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database response to TipRecord type
      const mappedTips: TipRecord[] = (data || []).map(tip => ({
        ...tip,
        status: tip.status as 'pending' | 'confirmed' | 'failed'
      }));
      
      setTips(mappedTips);
      return mappedTips;
    } catch (error) {
      console.error('Failed to fetch tips:', error);
      return [];
    }
  };

  return {
    tipArtist,
    fetchUserTips,
    tips,
    loading,
  };
};