import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { OnchainKitProvider as BaseOnchainProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';
import { config } from '@/lib/wagmi';

interface OnchainProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export const OnchainProvider = ({ children }: OnchainProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BaseOnchainProvider 
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''} 
          chain={base}
        >
          {children}
        </BaseOnchainProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};