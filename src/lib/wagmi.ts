import { http, createConfig } from 'wagmi';
import { base, mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base, mainnet, sepolia],
  connectors: [
    coinbaseWallet({
      appName: 'AudioBASE',
      preference: 'smartWalletOnly', // Use smart wallets by default
    }),
    metaMask(),
    walletConnect({
      projectId: 'your-walletconnect-project-id', // Replace with actual project ID
    }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}