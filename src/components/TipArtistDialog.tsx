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
import { Loader2, Zap, Heart, DollarSign, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTipping } from '@/hooks/useTipping';
import { useAccount } from 'wagmi';
import { useSolana } from '@/contexts/SolanaContext';

interface Artist {
  id: string;
  name: string;
  avatar?: string;
  followers?: string;
}

interface TipArtistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: Artist;
}

const TipArtistDialog: React.FC<TipArtistDialogProps> = ({
  open,
  onOpenChange,
  artist,
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [currency, setCurrency] = useState<'ETH' | 'SOL'>('ETH');
  const { toast } = useToast();
  const { tipArtist, loading } = useTipping();
  const { isConnected } = useAccount();
  const solana = useSolana();

  const predefinedAmounts = currency === 'ETH' 
    ? ['0.001', '0.005', '0.01', '0.05'] 
    : ['0.1', '0.5', '1', '5'];

  const handleTip = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid tip amount",
        variant: "destructive",
      });
      return;
    }

    const success = await tipArtist({
      artistId: artist.id,
      artistName: artist.name,
      amount: parseFloat(amount),
      currency,
      message: message.trim() || undefined,
    });

    if (success) {
      onOpenChange(false);
      setAmount('');
      setMessage('');
      toast({
        title: "Tip Sent! 🎉",
        description: `Successfully tipped ${amount} ${currency} to ${artist.name}`,
      });
    }
  };

  const isWalletConnected = currency === 'ETH' ? isConnected : solana.connected;
  const canTip = isWalletConnected && !loading && amount && parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Tip Artist
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for {artist.name} with a crypto tip
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
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label>Currency</Label>
            <div className="flex gap-2">
              <Button
                variant={currency === 'ETH' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrency('ETH')}
                className="flex-1"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                ETH
              </Button>
              <Button
                variant={currency === 'SOL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrency('SOL')}
                className="flex-1"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                SOL
              </Button>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-2">
            <Label>Amount ({currency})</Label>
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
              placeholder={`Custom amount in ${currency}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step={currency === 'ETH' ? '0.001' : '0.1'}
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
            {isWalletConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected ({currency})
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600">
                Not Connected
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleTip}
            disabled={!canTip}
            className="w-full gradient-primary"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Heart className="h-4 w-4 mr-2" />
            )}
            {!isWalletConnected
              ? `Connect ${currency} Wallet`
              : loading
              ? 'Processing Tip...'
              : `Tip ${amount || '0'} ${currency}`}
          </Button>

          {!isWalletConnected && (
            <p className="text-xs text-muted-foreground text-center">
              Please connect your {currency} wallet to send tips
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TipArtistDialog;