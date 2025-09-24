import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, DollarSign } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useSolana } from '@/contexts/SolanaContext';
import { EthBalance } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';

interface TokenBalanceProps {
  symbol: string;
  balance: string | number;
  usdValue?: string;
}

const TokenBalanceCard: React.FC<TokenBalanceProps> = ({ symbol, balance, usdValue }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <DollarSign className="h-4 w-4 text-primary" />
      </div>
      <span className="font-medium">{symbol}</span>
    </div>
    <div className="text-right">
      <p className="font-semibold">{balance}</p>
      {usdValue && (
        <p className="text-xs text-muted-foreground">${usdValue}</p>
      )}
    </div>
  </div>
);

export const WalletBalances: React.FC = () => {
  const { address: ethAddress, isConnected: isEthConnected, chainId } = useAccount();
  const { data: ethBalance } = useBalance({ address: ethAddress });
  const { connected: isSolConnected, balance: solBalance } = useSolana();

  const formatBalance = (balance: number | string | undefined, decimals = 4) => {
    if (!balance) return '0';
    return parseFloat(balance.toString()).toFixed(decimals);
  };

  const isOnBase = chainId === base.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ethereum/Base Balances */}
        {isEthConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Ethereum/Base</h3>
              <Badge variant={isOnBase ? 'default' : 'secondary'}>
                {isOnBase ? 'Base Network' : 'Ethereum'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <TokenBalanceCard
                symbol="ETH"
                balance={ethBalance ? `${formatBalance(ethBalance.formatted)}` : '0.0000'}
              />
              
              {/* USDC Balance on Base - Coming Soon */}
              {isOnBase && (
                <TokenBalanceCard
                  symbol="USDC"
                  balance="0.0000"
                />
              )}
            </div>
          </div>
        )}

        {/* Solana Balances */}
        {isSolConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Solana</h3>
              <Badge variant="secondary">
                Solana Network
              </Badge>
            </div>
            
            <TokenBalanceCard
              symbol="SOL"
              balance={formatBalance(solBalance)}
            />
          </div>
        )}

        {/* Connection Status */}
        {!isEthConnected && !isSolConnected && (
          <div className="text-center py-6">
            <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No wallets connected</p>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to view balances
            </p>
          </div>
        )}

        {/* Network Warning */}
        {isEthConnected && !isOnBase && (
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm text-orange-800">
              <Zap className="h-4 w-4 inline mr-1" />
              Switch to Base network for optimized tipping experience
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};