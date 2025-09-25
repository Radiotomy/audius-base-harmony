import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface OnchainTransactionProps {
  to: `0x${string}`;
  value?: string;
  data?: `0x${string}`;
  onSuccess?: (hash: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const OnchainTransaction: React.FC<OnchainTransactionProps> = ({
  to,
  value = '0',
  data,
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
}) => {
  const { isConnected } = useAccount();
  const { 
    sendTransaction, 
    data: hash, 
    isPending, 
    error 
  } = useSendTransaction();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  // Call onSuccess when we get a transaction hash
  useEffect(() => {
    if (hash && onSuccess) {
      onSuccess(hash);
    }
  }, [hash, onSuccess]);

  // Call onError when there's an error
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleTransaction = async () => {
    try {
      sendTransaction({
        to,
        value: value ? parseEther(value) : undefined,
        data,
      });
    } catch (err) {
      if (onError) {
        onError(err as Error);
      }
    }
  };

  return (
    <Button
      onClick={handleTransaction}
      disabled={disabled || !isConnected || isPending || isConfirming}
      className={`w-full gradient-primary ${className}`}
    >
      {isPending || isConfirming 
        ? 'Processing...' 
        : children || 'Execute Transaction'}
    </Button>
  );
};

// Helper for creating tip transaction calls
export const createTipCalls = (
  artistAddress: `0x${string}`,
  amount: string,
  contractAddress?: `0x${string}`
) => {
  return {
    to: contractAddress || artistAddress,
    value: amount,
    data: contractAddress ? '0x' as `0x${string}` : undefined,
  };
};

// Helper for creating NFT mint transaction calls
export const createMintCalls = (
  contractAddress: `0x${string}`,
  to: `0x${string}`,
  tokenId: string,
  mintPrice?: string
) => {
  return {
    to: contractAddress,
    value: mintPrice || '0',
    data: '0x' as `0x${string}`, // Would need actual contract ABI encoding
  };
};