import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';

export interface SolanaContextType {
  // From wallet adapter
  wallet: any;
  publicKey: any;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
  
  // Custom additions
  balance: number | null;
  refreshBalance: () => Promise<void>;
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within SolanaProvider');
  }
  return context;
};

// Inner component that uses wallet hooks
const SolanaContextProvider = ({ children }: { children: ReactNode }) => {
  const { wallet, publicKey, connected, connecting, disconnect, connect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = React.useState<number | null>(null);
  const { toast } = useToast();

  const refreshBalance = React.useCallback(async () => {
    if (!publicKey || !connection) {
      setBalance(null);
      return;
    }

    try {
      const balanceLamports = await connection.getBalance(publicKey);
      const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
      setBalance(Math.round(balanceSol * 10000) / 10000); // Round to 4 decimals
    } catch (error) {
      console.error('Error fetching Solana balance:', error);
      setBalance(null);
    }
  }, [publicKey, connection]);

  // Refresh balance when wallet connects
  React.useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
      toast({
        title: "Solana Wallet Connected",
        description: `Connected to ${wallet?.adapter?.name || 'wallet'}`,
      });
    } else if (!connected && balance !== null) {
      setBalance(null);
    }
  }, [connected, publicKey, refreshBalance, wallet, balance, toast]);

  const handleDisconnect = React.useCallback(async () => {
    try {
      await disconnect();
      setBalance(null);
      toast({
        title: "Solana Wallet Disconnected",
        description: "Your Solana wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Solana disconnect error:', error);
    }
  }, [disconnect, toast]);

  const handleConnect = React.useCallback(async () => {
    try {
      await connect();
    } catch (error: any) {
      console.error('Solana connection error:', error);
      toast({
        title: "Connection Failed", 
        description: error.message || "Failed to connect Solana wallet",
        variant: "destructive",
      });
    }
  }, [connect, toast]);

  const value = {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnect: handleDisconnect,
    connect: handleConnect,
    balance,
    refreshBalance,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
};

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider = ({ children }: SolanaProviderProps) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <SolanaContextProvider>
          {children}
        </SolanaContextProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};