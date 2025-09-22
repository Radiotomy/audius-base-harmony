import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ExternalLink, Copy, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useSolana } from '@/contexts/SolanaContext';
import { useToast } from '@/hooks/use-toast';

const WalletConnect = () => {
  const web3 = useWeb3();
  const solana = useSolana();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'ethereum' | 'solana'>('ethereum');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ethereum' | 'solana')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
          </TabsList>

          <TabsContent value="ethereum" className="space-y-4">
            {!web3.isConnected ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your Ethereum wallet to access Web3 features
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={web3.connectMetaMask}
                    disabled={web3.connecting}
                    className="w-full"
                    variant="outline"
                  >
                    {web3.connecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Connect MetaMask'
                    )}
                  </Button>
                  <Button 
                    onClick={web3.connectWalletConnect}
                    disabled={web3.connecting}
                    className="w-full"
                    variant="outline"
                  >
                    {web3.connecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Connect WalletConnect'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Connected
                  </Badge>
                  <Badge variant="outline">
                    {web3.walletType}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {formatAddress(web3.account!)}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(web3.account!, 'Address')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Balance</label>
                    <div className="text-2xl font-bold text-primary mt-1">
                      {web3.balance} ETH
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Network</label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {web3.chainId ? getNetworkName(web3.chainId) : 'Unknown'}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={web3.disconnect}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="solana" className="space-y-4">
            {!solana.connected ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your Solana wallet to access Solana features
                </p>
                <Button 
                  onClick={solana.connect}
                  disabled={solana.connecting}
                  className="w-full"
                  variant="outline"
                >
                  {solana.connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Connect Solana Wallet'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Connected
                  </Badge>
                  <Badge variant="outline">
                    {solana.wallet?.adapter?.name || 'Solana'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {formatAddress(solana.publicKey?.toString() || '')}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(solana.publicKey?.toString() || '', 'Address')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Balance</label>
                    <div className="text-2xl font-bold text-primary mt-1">
                      {solana.balance !== null ? `${solana.balance} SOL` : 'Loading...'}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={solana.refreshBalance}
                    className="w-full"
                  >
                    Refresh Balance
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={solana.disconnect}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;