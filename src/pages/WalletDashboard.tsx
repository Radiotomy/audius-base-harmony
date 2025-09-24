import React from 'react';
import Navigation from '@/components/Navigation';
import { TransactionHistory } from '@/components/TransactionHistory';
import { WalletBalances } from '@/components/WalletBalances';
import { SwapWidget } from '@/components/SwapWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSolana } from '@/contexts/SolanaContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const WalletDashboard: React.FC = () => {
  const { isConnected: isEthConnected } = useAccount();
  const { connected: isSolConnected } = useSolana();

  const hasWalletConnection = isEthConnected || isSolConnected;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
              {hasWalletConnection && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Manage your wallets, view transaction history, and swap tokens
            </p>
          </div>

          {!hasWalletConnection ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Wallet Connected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your Ethereum or Solana wallet to access your dashboard
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Balances and Swap */}
              <div className="space-y-6">
                <WalletBalances />
                <SwapWidget />
              </div>

              {/* Right Column - Transaction History */}
              <div className="lg:col-span-2">
                <TransactionHistory />
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {hasWalletConnection && (
            <div className="grid gap-4 md:grid-cols-3 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tips Sent
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Start tipping your favorite artists
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Artists Supported
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Unique artists you've tipped
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gas Saved
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                  <p className="text-xs text-muted-foreground">
                    Through Base Paymaster
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WalletDashboard;