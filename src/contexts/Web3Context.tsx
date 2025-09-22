import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useToast } from '@/hooks/use-toast';

export interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  account: string | null;
  balance: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  
  // Wallet types
  walletType: 'metamask' | 'walletconnect' | null;
  
  // Actions
  connectMetaMask: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Loading states
  connecting: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [walletType, setWalletType] = useState<'metamask' | 'walletconnect' | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [wcProvider, setWcProvider] = useState<any>(null);
  const { toast } = useToast();

  const updateBalance = async (address: string, ethProvider: ethers.BrowserProvider) => {
    try {
      const balanceWei = await ethProvider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to continue.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      const network = await ethProvider.getNetwork();
      
      setProvider(ethProvider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setWalletType('metamask');
      setIsConnected(true);
      
      await updateBalance(accounts[0], ethProvider);
      
      toast({
        title: "Wallet Connected",
        description: "MetaMask connected successfully!",
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          updateBalance(accounts[0], ethProvider);
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });
      
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    setConnecting(true);
    try {
      const wcProviderInstance = await EthereumProvider.init({
        projectId: 'your-walletconnect-project-id', // Replace with actual project ID
        chains: [1, 137, 56], // Ethereum, Polygon, BSC
        showQrModal: true,
      });

      await wcProviderInstance.enable();
      
      const ethProvider = new ethers.BrowserProvider(wcProviderInstance);
      const accounts = await ethProvider.listAccounts();
      const network = await ethProvider.getNetwork();
      
      setWcProvider(wcProviderInstance);
      setProvider(ethProvider);
      setAccount(accounts[0].address);
      setChainId(Number(network.chainId));
      setWalletType('walletconnect');
      setIsConnected(true);
      
      await updateBalance(accounts[0].address, ethProvider);
      
      toast({
        title: "Wallet Connected",
        description: "WalletConnect connected successfully!",
      });

      wcProviderInstance.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          updateBalance(accounts[0], ethProvider);
        }
      });

      wcProviderInstance.on('chainChanged', (chainId: number) => {
        setChainId(chainId);
      });

    } catch (error: any) {
      console.error('WalletConnect error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect with WalletConnect",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      if (wcProvider) {
        await wcProvider.disconnect();
        setWcProvider(null);
      }
      
      setIsConnected(false);
      setAccount(null);
      setBalance(null);
      setChainId(null);
      setProvider(null);
      setWalletType(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum || walletType !== 'metamask') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        toast({
          title: "Network Not Added",
          description: "Please add this network to your wallet first.",
          variant: "destructive",
        });
      }
    }
  };

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await ethProvider.send("eth_accounts", []);
          if (accounts.length > 0) {
            const network = await ethProvider.getNetwork();
            setProvider(ethProvider);
            setAccount(accounts[0]);
            setChainId(Number(network.chainId));
            setWalletType('metamask');
            setIsConnected(true);
            await updateBalance(accounts[0], ethProvider);
          }
        } catch (error) {
          console.error('Auto-connect error:', error);
        }
      }
    };

    autoConnect();
  }, []);

  const value = {
    isConnected,
    account,
    balance,
    chainId,
    provider,
    walletType,
    connectMetaMask,
    connectWalletConnect,
    disconnect,
    switchNetwork,
    connecting,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Types for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}