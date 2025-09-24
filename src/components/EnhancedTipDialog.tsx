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
import { Loader2, Zap, Heart, DollarSign, Wallet, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { Transaction, TransactionButton, TransactionSponsor, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { parseEther } from 'viem';
import { supabase } from '@/integrations/supabase/client';

interface Artist {
  id: string;
  name: string;
  avatar?: string;
  followers?: string;
  wallet_address?: string;
}

interface EnhancedTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: Artist;
}

const ARTIST_TIP_CONTRACT = '0x0000000000000000000000000000000000000000'; // Replace with actual contract address

export const EnhancedTipDialog: React.FC<EnhancedTipDialogProps> = ({
  open,
  onOpenChange,
  artist,
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const predefinedAmounts = ['0.001', '0.005', '0.01', '0.05'];

  const handleOnStatus = (status: any) => {
    console.log('Transaction status:', status);
    
    if (status.statusName === 'success') {
      // Save to database
      saveTipToDatabase(status.receipt.transactionHash);
      
      toast({
        title: "Tip Sent Successfully! 🎉",
        description: `${amount} ETH sent to ${artist.name}`,
      });
      
      // Reset form
      setAmount('');
      setMessage('');
      onOpenChange(false);
    } else if (status.statusName === 'error') {
      toast({
        title: "Transaction Failed",
        description: status.error?.message || "Failed to send tip",
        variant: "destructive",
      });
    }
  };

  const saveTipToDatabase = async (transactionHash: string) => {
    try {
      const { error } = await supabase
        .from('artist_tips')
        .insert({
          artist_id: artist.id,
          artist_name: artist.name,
          amount: parseFloat(amount),
          currency: 'ETH',
          message: message.trim() || null,
          wallet_address: address!,
          transaction_hash: transactionHash,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving tip to database:', error);
    }
  };

  const contracts = [
    {
      address: ARTIST_TIP_CONTRACT,
      functionName: 'tipArtist',
      args: [artist.wallet_address || artist.id, message],
      value: parseEther(amount || '0'),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Tip Artist
          </DialogTitle>
          <DialogDescription>
            Send a tip to {artist.name} on Base network with gas sponsorship
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
            <div>
              <h3 className="font-semibold text-foreground">{artist.name}</h3>
              {artist.followers && (
                <p className="text-sm text-muted-foreground">
                  {artist.followers} followers
                </p>
              )}
              {artist.wallet_address && (
                <Identity address={artist.wallet_address as `0x${string}`}>
                  <Avatar />
                  <Name />
                </Identity>
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
                  onClick={() => setAmount(preAmount)}
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

          {/* Transaction Component */}
          {isConnected && amount && parseFloat(amount) > 0 ? (
            <Transaction
              contracts={contracts}
              onStatus={handleOnStatus}
            >
              <TransactionButton className="w-full gradient-primary" text={`Tip ${amount} ETH`} />
              <TransactionSponsor />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <div className="space-y-3">
              {/* Wallet Status */}
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4" />
                <span className="text-muted-foreground">Wallet Status:</span>
                {isConnected ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600">
                    Not Connected
                  </Badge>
                )}
              </div>

              <Button disabled className="w-full" size="lg">
                <Heart className="h-4 w-4 mr-2" />
                {!isConnected
                  ? 'Connect Wallet to Tip'
                  : !amount || parseFloat(amount) <= 0
                  ? 'Enter Amount to Tip'
                  : 'Ready to Tip'}
              </Button>

              {!isConnected && (
                <p className="text-xs text-muted-foreground text-center">
                  Please connect your wallet to send tips
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};