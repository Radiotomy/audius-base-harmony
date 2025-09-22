import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAccount, usePublicClient, useChainId } from 'wagmi';
import { useSolana } from '@/contexts/SolanaContext';
import { useToast } from '@/hooks/use-toast';
import { formatEther } from 'viem';

interface EthereumTransaction {
  hash: string;
  blockNumber: bigint;
  from: string;
  to: string | null;
  value: string;
  timestamp: number;
  status: 'success' | 'failed';
}

interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  fee: number;
  status: 'success' | 'failed';
}

const OnchainTransactionHistory = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const solana = useSolana();
  const { toast } = useToast();
  
  const [ethTransactions, setEthTransactions] = useState<EthereumTransaction[]>([]);
  const [solTransactions, setSolTransactions] = useState<SolanaTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ethereum' | 'solana'>('ethereum');

  const fetchEthereumTransactions = async () => {
    if (!publicClient || !address) return;

    setLoading(true);
    try {
      // Get recent transactions (simplified - in production use proper indexing)
      const latestBlockNumber = await publicClient.getBlockNumber();
      const transactions: EthereumTransaction[] = [];

      // Scan last 100 blocks for user transactions
      for (let i = 0; i < 100 && transactions.length < 10; i++) {
        try {
          const block = await publicClient.getBlock({
            blockNumber: latestBlockNumber - BigInt(i),
            includeTransactions: true,
          });

          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (typeof tx === 'object' && (tx.from === address || tx.to === address)) {
                const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash });
                
                transactions.push({
                  hash: tx.hash,
                  blockNumber: tx.blockNumber || 0n,
                  from: tx.from,
                  to: tx.to,
                  value: formatEther(tx.value),
                  timestamp: Number(block.timestamp),
                  status: receipt.status === 'success' ? 'success' : 'failed',
                });

                if (transactions.length >= 10) break;
              }
            }
          }
        } catch (error) {
          // Skip blocks that can't be fetched
          continue;
        }
      }

      setEthTransactions(transactions.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error: any) {
      console.error('Error fetching Ethereum transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Ethereum transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSolanaTransactions = async () => {
    if (!solana.publicKey) return;

    setLoading(true);
    try {
      // Simplified mock data - in production use Solana RPC methods
      const transactions: SolanaTransaction[] = [
        {
          signature: '5j8rVm2Emh7UzTzgJjHxKJPqC7VDFh9L4TuQXwzaGjLpB3Wi4B9zf3VdY9zCeJ6mFnE2vKdoXwbKJhL8aDqVuN7M',
          slot: 150000000,
          blockTime: Date.now() / 1000 - 3600,
          fee: 0.00001,
          status: 'success',
        },
        {
          signature: '4h7qUm1Dmh6TzSzfIiGwJIOoC6VCFg8L3TpPXvyaFiKoA2Vh3A8ye2UcX8aBdI5lEm3vNcnXvaNJhK7azcqUuM6L',
          slot: 149999500,
          blockTime: Date.now() / 1000 - 7200,
          fee: 0.00001,
          status: 'success',
        },
      ];

      setSolTransactions(transactions);
    } catch (error: any) {
      console.error('Error fetching Solana transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Solana transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ethereum' && isConnected) {
      fetchEthereumTransactions();
    } else if (activeTab === 'solana' && solana.connected) {
      fetchSolanaTransactions();
    }
  }, [activeTab, isConnected, solana.connected, address, solana.publicKey]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getExplorerUrl = (type: 'ethereum' | 'solana', hash: string) => {
    if (type === 'ethereum') {
      const baseUrls: { [key: number]: string } = {
        1: 'https://etherscan.io',
        8453: 'https://basescan.org',
        11155111: 'https://sepolia.etherscan.io',
      };
      const baseUrl = baseUrls[chainId] || 'https://etherscan.io';
      return `${baseUrl}/tx/${hash}`;
    } else {
      return `https://explorer.solana.com/tx/${hash}`;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaction History</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={activeTab === 'ethereum' ? fetchEthereumTransactions : fetchSolanaTransactions}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ethereum' | 'solana')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
          </TabsList>

          <TabsContent value="ethereum" className="space-y-4">
            {!isConnected ? (
              <p className="text-center text-muted-foreground py-8">
                Connect your Ethereum wallet to view transaction history
              </p>
            ) : ethTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {loading ? 'Loading transactions...' : 'No transactions found'}
              </p>
            ) : (
              <div className="space-y-3">
                {ethTransactions.map((tx) => (
                  <div key={tx.hash} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tx.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <code className="text-sm">{formatAddress(tx.hash)}</code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl('ethereum', tx.hash), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">From:</span>
                        <br />
                        <code>{formatAddress(tx.from)}</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">To:</span>
                        <br />
                        <code>{formatAddress(tx.to || '')}</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <br />
                        <span className="font-medium">{parseFloat(tx.value).toFixed(6)} ETH</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <br />
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="solana" className="space-y-4">
            {!solana.connected ? (
              <p className="text-center text-muted-foreground py-8">
                Connect your Solana wallet to view transaction history
              </p>
            ) : solTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {loading ? 'Loading transactions...' : 'No transactions found'}
              </p>
            ) : (
              <div className="space-y-3">
                {solTransactions.map((tx) => (
                  <div key={tx.signature} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tx.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <code className="text-sm">{formatAddress(tx.signature)}</code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl('solana', tx.signature), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Slot:</span>
                        <br />
                        <span className="font-mono">{tx.slot.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fee:</span>
                        <br />
                        <span className="font-medium">{tx.fee} SOL</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Time:</span>
                        <br />
                        {formatTimestamp(tx.blockTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OnchainTransactionHistory;