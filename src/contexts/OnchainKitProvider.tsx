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

// Get CDP API configuration from environment variables
const CDP_API_KEY = import.meta.env.VITE_CDP_API_KEY;
const CDP_PROJECT_ID = import.meta.env.VITE_CDP_PROJECT_ID;

export const OnchainProvider = ({ children }: OnchainProviderProps) => {
  // Validate required environment variables
  if (!CDP_API_KEY || CDP_API_KEY === 'YOUR_CDP_API_KEY_HERE') {
    console.error('❌ CDP API Key is missing or not configured. Please set VITE_CDP_API_KEY in your .env file.');
    console.error('Get your API key from: https://portal.cdp.coinbase.com/');
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg m-4">
        <h3 className="font-semibold text-destructive mb-2">OnchainKit Configuration Error</h3>
        <p className="text-sm text-muted-foreground mb-2">
          CDP API Key is missing. Please:
        </p>
        <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
          <li>Get your API key from <a href="https://portal.cdp.coinbase.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Coinbase Developer Portal</a></li>
          <li>Add VITE_CDP_API_KEY to your .env file</li>
          <li>Restart your development server</li>
        </ol>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BaseOnchainProvider 
          apiKey={CDP_API_KEY}
          chain={base}
          projectId={CDP_PROJECT_ID}
        >
          {children}
        </BaseOnchainProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};