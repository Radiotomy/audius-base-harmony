import { useState, useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';

interface PaymasterConfig {
  enabled: boolean;
  sponsorGas: boolean;
  maxGasLimit: bigint;
}

export const usePaymaster = () => {
  const [config, setConfig] = useState<PaymasterConfig>({
    enabled: true,
    sponsorGas: true,
    maxGasLimit: parseEther('0.01'), // Max 0.01 ETH gas sponsorship
  });
  
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const sponsorTransaction = useCallback(async (
    contractAddress: `0x${string}`,
    functionName: string,
    args: any[],
    value?: bigint
  ) => {
    if (!config.enabled || !config.sponsorGas) {
      toast.error('Gas sponsorship not enabled');
      return;
    }

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      toast.loading('Preparing gasless transaction...');
      
      // Use Coinbase Paymaster API for gas sponsorship
      const paymasterResponse = await fetch('/api/paymaster/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          contractAddress,
          functionName,
          args,
          value: value?.toString(),
        }),
      });

      if (!paymasterResponse.ok) {
        throw new Error('Paymaster sponsorship failed');
      }

      const { sponsored } = await paymasterResponse.json();
      
      if (sponsored) {
        toast.success('Transaction sponsored! No gas fees required.');
        
        // Execute the sponsored transaction
        const result = await writeContract({
          address: contractAddress,
          abi: [] as const, // Contract ABI would be provided
          functionName,
          args,
          value,
        });
        
        return result;
      } else {
        toast.error('Gas sponsorship unavailable for this transaction');
      }
    } catch (error) {
      console.error('Paymaster error:', error);
      toast.error('Failed to sponsor transaction');
      throw error;
    }
  }, [config, address, writeContract]);

  const toggleSponsorship = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      sponsorGas: !prev.sponsorGas
    }));
  }, []);

  return {
    config,
    sponsorTransaction,
    toggleSponsorship,
    isEnabled: config.enabled && config.sponsorGas,
  };
};