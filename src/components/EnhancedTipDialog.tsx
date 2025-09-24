import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useContractAddresses } from '@/hooks/useContractAddresses';

// Enhanced input validation schema
const tipSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 10;
    }, 'Amount must be between 0 and 10 ETH'),
  message: z.string()
    .max(200, 'Message must be less than 200 characters')
    .optional()
    .refine((val) => {
      // Basic XSS protection - no script tags or suspicious patterns
      if (!val) return true;
      return !/<script|javascript:|on\w+=/i.test(val);
    }, 'Invalid characters in message'),
});

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

export const EnhancedTipDialog: React.FC<EnhancedTipDialogProps> = ({
  open,
  onOpenChange,
  artist,
}) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { artistTippingAddress } = useContractAddresses();

  const form = useForm<z.infer<typeof tipSchema>>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      amount: '',
      message: '',
    },
  });

  const { watch, handleSubmit, setValue, formState: { errors } } = form;
  const amount = watch('amount');
  const message = watch('message');

  const predefinedAmounts = ['0.001', '0.005', '0.01', '0.05'];

  const handlePredefinedAmount = (preAmount: string) => {
    setValue('amount', preAmount);
  };

  const saveTipToDatabase = async (transactionHash: string, tipAmount: string, tipMessage: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('artist_tips')
        .insert({
          user_id: user.id,
          artist_id: artist.id,
          artist_name: artist.name,
          amount: parseFloat(tipAmount),
          currency: 'ETH',
          message: tipMessage?.trim() || null,
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

  const onSubmit = async (data: z.infer<typeof tipSchema>) => {
    try {
      await saveTipToDatabase('pending_transaction', data.amount, data.message || '');
      toast({
        title: "Tip Initiated! 🎉",
        description: `Sending ${data.amount} ETH to ${artist.name}`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process tip",
        variant: "destructive",
      });
    }
  };

  const contracts = [
    {
      address: artistTippingAddress,
      functionName: 'tipArtist',
      args: [artist.wallet_address || artist.id, message, `tip_${Date.now()}`],
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
                  onClick={() => handlePredefinedAmount(preAmount)}
                  className="text-xs"
                  type="button"
                >
                  {preAmount}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Custom amount in ETH"
              {...form.register('amount')}
              step="0.001"
              min="0"
              max="10"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              placeholder="Leave a message for the artist..."
              {...form.register('message')}
              maxLength={200}
              rows={3}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
            {message && (
              <div className="text-xs text-muted-foreground text-right">
                {message.length}/200 characters
              </div>
            )}
          </div>

          <Separator />

          {/* Transaction Component */}
          {isConnected && amount && parseFloat(amount) > 0 ? (
            <Button 
              onClick={handleSubmit(onSubmit)}
              className="w-full gradient-primary" 
              size="lg"
              type="button"
            >
              <Heart className="h-4 w-4 mr-2" />
              Send {amount} ETH Tip
            </Button>
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