import React, { useState } from 'react';
import { Wallet, ChevronDown, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useSolana } from '@/contexts/SolanaContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const MobileWalletConnection = () => {
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: ethAddress });
  const { connected: isSolConnected, publicKey, disconnect: disconnectSolana } = useSolana();
  const { disconnect: disconnectEth } = useDisconnect();
  const { toast } = useToast();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast({
        title: "Address Copied",
        description: `${type} address copied to clipboard`,
      });
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isConnected = isEthConnected || isSolConnected;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant={isConnected ? "outline" : "default"}
          size="sm"
          className={cn(
            "wallet-button touch-target relative",
            isConnected ? "gradient-accent border-accent text-accent-foreground" : "gradient-primary"
          )}
        >
          <Wallet className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {isConnected ? 'Connected' : 'Connect'}
          </span>
          {isConnected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Wallet Connection</h2>
            <Badge variant={isConnected ? "default" : "outline"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                Connect your wallet to tip artists, mint NFTs, and access Web3 features.
              </p>
              
              <div className="grid gap-3">
                <Card className="p-4 border-dashed border-primary/50 hover:border-primary transition-colors cursor-pointer touch-action-manipulation">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🦊</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">MetaMask</h3>
                      <p className="text-sm text-muted-foreground">Connect with MetaMask</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>

                <Card className="p-4 border-dashed border-secondary/50 hover:border-secondary transition-colors cursor-pointer touch-action-manipulation">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👛</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Solana Wallets</h3>
                      <p className="text-sm text-muted-foreground">Phantom, Solflare, etc.</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ethereum Wallet */}
              {isEthConnected && ethAddress && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      Ethereum
                    </h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {shortenAddress(ethAddress)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(ethAddress, 'Ethereum')}
                          className="h-8 w-8 p-0 touch-target"
                        >
                          {copiedAddress === ethAddress ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {ethBalance && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <span className="text-sm font-medium">
                          {parseFloat(ethBalance.formatted).toFixed(4)} {ethBalance.symbol}
                        </span>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectEth()}
                      className="w-full touch-target"
                    >
                      Disconnect Ethereum
                    </Button>
                  </div>
                </Card>
              )}

              {/* Solana Wallet */}
              {isSolConnected && publicKey && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="text-lg">◎</span>
                      Solana
                    </h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {shortenAddress(publicKey.toString())}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(publicKey.toString(), 'Solana')}
                          className="h-8 w-8 p-0 touch-target"
                        >
                          {copiedAddress === publicKey.toString() ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnectSolana}
                      className="w-full touch-target"
                    >
                      Disconnect Solana
                    </Button>
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="touch-target">
                  <span className="text-lg mr-2">💰</span>
                  Send Tip
                </Button>
                <Button variant="outline" size="sm" className="touch-target">
                  <span className="text-lg mr-2">🎨</span>
                  Mint NFT
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileWalletConnection;