import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
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

  const checkSponsorship = useCallback(async (
    contractAddress: `0x${string}`,
    functionName: string,
    args: any[],
    value?: bigint
  ): Promise<{ sponsored: boolean; transactionHash?: string }> => {
    if (!config.enabled || !config.sponsorGas) {
      return { sponsored: false };
    }

    if (!address) {
      return { sponsored: false };
    }

    try {
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
        return { sponsored: false };
      }

      const result = await paymasterResponse.json();
      return {
        sponsored: result.sponsored,
        transactionHash: result.transactionHash,
      };
    } catch (error) {
      console.error('Paymaster error:', error);
      return { sponsored: false };
    }
  }, [config, address]);

  const toggleSponsorship = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      sponsorGas: !prev.sponsorGas
    }));
  }, []);

  return {
    config,
    checkSponsorship,
    toggleSponsorship,
    isEnabled: config.enabled && config.sponsorGas,
  };
};