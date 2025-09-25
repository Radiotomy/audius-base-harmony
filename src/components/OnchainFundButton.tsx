import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { Wallet, CreditCard } from 'lucide-react';

interface OnchainFundButtonProps {
  className?: string;
  variant?: 'card' | 'button';
}

export const OnchainFundButton: React.FC<OnchainFundButtonProps> = ({ 
  className, 
  variant = 'card' 
}) => {
  const { address, isConnected } = useAccount();

  const handleFundWallet = () => {
    if (!address) return;
    
    // Use Coinbase Wallet's buy crypto flow
    const buyURL = `https://pay.coinbase.com/buy/select-asset?appId=your-app-id&addresses=${address}&assets=ETH,USDC&blockchain=base`;
    window.open(buyURL, '_blank', 'popup,width=540,height=700');
  };

  if (variant === 'button') {
    return (
      <Button 
        onClick={handleFundWallet}
        disabled={!isConnected}
        className={className}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Fund Wallet
      </Button>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Fund Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add funds to your wallet to start tipping artists and buying NFTs
            </p>
            <Button 
              onClick={handleFundWallet}
              className="w-full gradient-primary"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Buy Crypto
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Connect wallet to add funds</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};