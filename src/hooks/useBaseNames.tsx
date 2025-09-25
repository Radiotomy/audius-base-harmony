import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { normalize } from 'viem/ens';

interface BaseNameData {
  name: string | null;
  avatar: string | null;
  description: string | null;
  loading: boolean;
  error: string | null;
}

export const useBaseNames = () => {
  const { address } = useAccount();
  const [nameData, setNameData] = useState<BaseNameData>({
    name: null,
    avatar: null,
    description: null,
    loading: false,
    error: null,
  });

  const resolveBaseName = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return null;
    
    try {
      setNameData(prev => ({ ...prev, loading: true, error: null }));
      
      // Use Base Names API to resolve address to name
      const response = await fetch(`https://api.basenames.org/v1/name/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to resolve Base name');
      }
      
      const data = await response.json();
      
      setNameData({
        name: data.name || null,
        avatar: data.avatar || null,
        description: data.description || null,
        loading: false,
        error: null,
      });
      
      return data.name;
    } catch (error) {
      console.error('Error resolving Base name:', error);
      setNameData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      return null;
    }
  }, []);

  const resolveNameToAddress = useCallback(async (baseName: string) => {
    try {
      const normalizedName = normalize(baseName);
      
      // Use Base Names API to resolve name to address
      const response = await fetch(`https://api.basenames.org/v1/address/${normalizedName}`);
      
      if (!response.ok) {
        throw new Error('Failed to resolve Base name to address');
      }
      
      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error('Error resolving name to address:', error);
      throw error;
    }
  }, []);

  const registerBaseName = useCallback(async (desiredName: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Check name availability
      const isAvailable = await checkNameAvailability(desiredName);
      if (!isAvailable) {
        throw new Error('Name is not available');
      }

      // Register name through Base Names registry
      const response = await fetch('https://api.basenames.org/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: desiredName,
          address: address,
          duration: 365, // 1 year registration
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register Base name');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error registering Base name:', error);
      throw error;
    }
  }, [address]);

  const checkNameAvailability = useCallback(async (name: string) => {
    try {
      const response = await fetch(`https://api.basenames.org/v1/available/${name}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking name availability:', error);
      return false;
    }
  }, []);

  // Auto-resolve name when address changes
  useEffect(() => {
    if (address) {
      resolveBaseName(address);
    }
  }, [address, resolveBaseName]);

  return {
    ...nameData,
    resolveBaseName,
    resolveNameToAddress,
    registerBaseName,
    checkNameAvailability,
    hasBaseName: !!nameData.name,
  };
};