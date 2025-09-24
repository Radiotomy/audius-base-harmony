import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, Info } from 'lucide-react';
import { Swap, SwapAmountInput, SwapToggleButton, SwapButton, SwapMessage } from '@coinbase/onchainkit/swap';
import { TokenSelectDropdown, Token } from '@coinbase/onchainkit/token';
import { useAccount } from 'wagmi';

// Base network tokens
const ETH_TOKEN: Token = {
  address: "",
  chainId: 8453,
  decimals: 18,
  name: "Ethereum",
  symbol: "ETH",
  image: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
};

const USDC_TOKEN: Token = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  chainId: 8453,
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
  image: "https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTkyNWYtMjdkNDA3NGIzZTY4",
};

const swappableTokens: Token[] = [ETH_TOKEN, USDC_TOKEN];

export const SwapWidget: React.FC = () => {
  const { isConnected } = useAccount();

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
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Get tokens for tipping</p>
                  <p className="text-xs mt-1">
                    Swap your ETH for USDC or other tokens to tip artists
                  </p>
                </div>
              </div>
            </div>

            <Swap>
              <SwapAmountInput
                label="Sell"
                swappableTokens={swappableTokens}
                token={ETH_TOKEN}
                type="from"
              />
              <SwapToggleButton />
              <SwapAmountInput
                label="Buy"
                swappableTokens={swappableTokens}
                token={USDC_TOKEN}
                type="to"
              />
              <SwapButton className="w-full gradient-primary" />
              <SwapMessage />
            </Swap>
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