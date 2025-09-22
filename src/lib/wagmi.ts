import { http, createConfig } from 'wagmi';
import { base, mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base, mainnet, sepolia],
  connectors: [
    coinbaseWallet({
      appName: 'AudioBASE',
      preference: 'smartWalletOnly', // Use smart wallets by default
    }),
    metaMask(),
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