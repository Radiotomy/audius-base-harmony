import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Copy, RefreshCw } from 'lucide-react';
import { useAccount, useBalance, useDisconnect, useConnect } from 'wagmi';
import { ConnectWallet, Wallet as OnchainWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Identity, Address, EthBalance } from '@coinbase/onchainkit/identity';
import { useSolana } from '@/contexts/SolanaContext';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectionDialogProps {
  children: React.ReactNode;
}

export const WalletConnectionDialog: React.FC<WalletConnectionDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Ethereum/Base wallet hooks
  const { address: ethAddress, isConnected: isEthConnected, connector: ethConnector } = useAccount();
  const { data: ethBalance } = useBalance({ address: ethAddress });
  const { disconnect: disconnectEth } = useDisconnect();
  const { connectors, connect, isPending } = useConnect();

  // Solana wallet hooks
  const { 
    connected: isSolConnected, 
    publicKey: solAddress, 
    balance: solBalance, 
    connect: connectSol, 
    disconnect: disconnectSol,
    refreshBalance 
  } = useSolana();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} address copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  const formatBalance = (balance: number | string | undefined, decimals = 4) => {
    if (!balance) return '0';
    return parseFloat(balance.toString()).toFixed(decimals);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>Choose a wallet to connect and manage balances.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="ethereum" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ethereum">Ethereum/Base</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ethereum" className="space-y-4">
            {!isEthConnected || !ethAddress ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Ethereum wallet to tip artists and mint NFTs on Base network.
                </p>
                <OnchainWallet>
                  <ConnectWallet />
                </OnchainWallet>
                {connectors?.find((c) => c.name?.toLowerCase().includes('meta')) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => connect({ connector: connectors.find((c) => c.name?.toLowerCase().includes('meta'))! })}
                    disabled={isPending}
                  >
                    Connect with MetaMask
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <OnchainWallet>
                    <div className="flex items-center gap-3 mb-3">
                      <Identity address={ethAddress} className="flex items-center gap-2">
                        <Avatar />
                        <div className="flex flex-col">
                          <Name />
                          <Address />
                        </div>
                      </Identity>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <EthBalance address={ethAddress} />
                        <p className="text-xs text-muted-foreground mt-1">
                          Connected via: <span className="font-medium">{ethConnector?.name || 'Unknown Wallet'}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(ethAddress!, 'Ethereum')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectEth()}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </OnchainWallet>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="solana" className="space-y-4">
            {!isSolConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Solana wallet for additional Web3 features and cross-chain interactions.
                </p>
                <Button onClick={connectSol} className="w-full">
                  Connect Solana Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Solana Wallet</p>
                      <p className="font-mono text-sm">{shortenAddress(solAddress!.toString())}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(solAddress!.toString(), 'Solana')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshBalance}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-semibold">{formatBalance(solBalance)} SOL</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnectSol}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};