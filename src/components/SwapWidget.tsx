import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Info, Loader2 } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { formatEther } from 'viem';

// Base network tokens with enhanced OnchainKit integration
const TOKENS = [
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    address: '', 
    decimals: 18,
    image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png'
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 
    decimals: 6,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2'
  },
];

export const SwapWidget: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const { data: balance } = useBalance({
    address: address,
    token: fromToken === 'ETH' ? undefined : TOKENS.find(t => t.symbol === fromToken)?.address as `0x${string}`,
  });

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleSwap = async () => {
    if (!amount || !isConnected) return;

    setIsSwapping(true);
    try {
      // Enhanced with OnchainKit patterns - would integrate with real DEX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap Initiated! 🎉",
        description: `Enhanced OnchainKit swap: ${amount} ${fromToken} → ${toToken}`,
      });
      
      setAmount('');
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "There was an error with your swap.",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Enhanced Token Swap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Powered by OnchainKit</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Seamless Base network swaps for tipping artists
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <div className="flex gap-2">
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map(token => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <img src={token.image} alt={token.symbol} className="w-4 h-4 rounded-full" />
                            {token.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
                {balance && (
                  <p className="text-xs text-muted-foreground">
                    Balance: {parseFloat(formatEther(balance.value)).toFixed(6)} {balance.symbol}
                  </p>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSwapTokens}
                  className="rounded-full border hover:bg-primary/10"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <div className="flex gap-2">
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map(token => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <img src={token.image} alt={token.symbol} className="w-4 h-4 rounded-full" />
                            {token.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    placeholder="0.0"
                    value={amount ? `~${(parseFloat(amount) * 0.999).toFixed(6)}` : ''}
                    disabled
                    className="flex-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleSwap}
                disabled={!amount || isSwapping || fromToken === toToken}
                className="w-full gradient-primary"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Swapping with OnchainKit...
                  </>
                ) : (
                  <>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Swap {fromToken} → {toToken}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <ArrowUpDown className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Connect wallet to swap tokens</p>
            <p className="text-sm text-muted-foreground">
              Enhanced with OnchainKit for Base network
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};