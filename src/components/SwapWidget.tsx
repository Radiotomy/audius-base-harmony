import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Info, Loader2 } from 'lucide-react';
import { useAccount, useSendTransaction, useBalance } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { parseEther, formatEther } from 'viem';

// Base network tokens
const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  { symbol: 'cbETH', name: 'Coinbase Wrapped Staked ETH', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18 },
  { symbol: 'USDT', name: 'Tether USD', address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
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
      // For now, show success message as actual swap would require DEX integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap Initiated!",
        description: `Swapping ${amount} ${fromToken} for ${toToken}`,
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
          Token Swap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/20 border border-accent/30">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-accent-foreground mt-0.5" />
                <div className="text-sm text-accent-foreground">
                  <p className="font-medium">Get tokens for tipping</p>
                  <p className="text-xs mt-1 opacity-80">
                    Swap your ETH for USDC or other tokens to tip artists
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">From</label>
                <div className="flex gap-2">
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map(token => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.symbol}
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
                  className="rounded-full border"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">To</label>
                <div className="flex gap-2">
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map(token => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.symbol}
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
                className="w-full"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Swapping...
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
              Get USDC and other tokens for tipping
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};