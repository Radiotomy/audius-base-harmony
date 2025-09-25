import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Heart, DollarSign, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { OnchainTransaction, createTipCalls } from './OnchainTransaction';
import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity';
import { supabase } from '@/integrations/supabase/client';

interface Artist {
  id: string;
  name: string;
  avatar?: string;
  followers?: string;
  wallet_address?: string;
}

interface EnhancedOnchainTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: Artist;
}

export const EnhancedOnchainTipDialog: React.FC<EnhancedOnchainTipDialogProps> = ({
  open,
  onOpenChange,
  artist,
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { isConnected, address } = useAccount();

  const predefinedAmounts = ['0.001', '0.005', '0.01', '0.05'];

  const handlePredefinedAmount = (preAmount: string) => {
    setAmount(preAmount);
  };

  const saveTipToDatabase = async (transactionHash: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !artist.wallet_address) return;

      await supabase.from('artist_tips').insert({
        user_id: user.id,
        artist_id: artist.id,
        artist_name: artist.name,
        artist_wallet_address: artist.wallet_address,
        amount: parseFloat(amount),
        currency: 'ETH',
        message: message.trim() || null,
        transaction_hash: transactionHash,
        wallet_address: address,
        status: 'confirmed',
        network: 'base',
        confirmed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving tip to database:', error);
    }
  };

  const onSuccess = async (response: any) => {
    if (response?.transactionReceipts?.[0]?.transactionHash) {
      await saveTipToDatabase(response.transactionReceipts[0].transactionHash);
    }
    
    onOpenChange(false);
    setAmount('');
    setMessage('');
    
    toast({
      title: "Tip Sent! 🎉",
      description: `Successfully tipped ${amount} ETH to ${artist.name}`,
    });
  };

  const onError = (error: Error) => {
    toast({
      title: "Tip Failed",
      description: error.message || "There was an error sending your tip.",
      variant: "destructive",
    });
  };

  const tipCall = artist.wallet_address && amount ? 
    createTipCalls(
      artist.wallet_address as `0x${string}`,
      amount
    ) : null;

  const canTip = isConnected && amount && parseFloat(amount) > 0 && artist.wallet_address;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Tip Artist with OnchainKit
          </DialogTitle>
          <DialogDescription>
            Send an on-chain tip to {artist.name} using Base network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Artist Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            {artist.avatar ? (
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {artist.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{artist.name}</h3>
              {artist.followers && (
                <p className="text-sm text-muted-foreground">
                  {artist.followers} followers
                </p>
              )}
              {artist.wallet_address && (
                <div className="mt-1">
                  <Identity address={artist.wallet_address as `0x${string}`} className="text-xs">
                    <Avatar className="w-4 h-4" />
                    <Address className="text-xs" />
                  </Identity>
                </div>
              )}
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-2">
            <Label>Amount (ETH)</Label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {predefinedAmounts.map((preAmount) => (
                <Button
                  key={preAmount}
                  variant={amount === preAmount ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePredefinedAmount(preAmount)}
                  className="text-xs"
                >
                  {preAmount}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Custom amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.001"
              min="0"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              placeholder="Leave a message for the artist..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
            />
            {message && (
              <div className="text-xs text-muted-foreground text-right">
                {message.length}/200 characters
              </div>
            )}
          </div>

          <Separator />

          {/* Wallet Status */}
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4" />
            <span className="text-muted-foreground">Wallet Status:</span>
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected (Base)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600">
                Not Connected
              </Badge>
            )}
          </div>

          {/* Transaction Button */}
          {canTip && tipCall ? (
            <OnchainTransaction
              to={tipCall.to}
              value={tipCall.value}
              data={tipCall.data}
              onSuccess={onSuccess}
              onError={onError}
            >
              <Heart className="h-4 w-4 mr-2" />
              Tip {amount} ETH
            </OnchainTransaction>
          ) : (
            <Button disabled className="w-full">
              {!isConnected
                ? 'Connect Wallet'
                : !artist.wallet_address
                ? 'Artist wallet not available'
                : !amount
                ? 'Enter amount'
                : 'Tip Artist'}
            </Button>
          )}

          {!isConnected && (
            <p className="text-xs text-muted-foreground text-center">
              Please connect your wallet to send tips on Base network
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};