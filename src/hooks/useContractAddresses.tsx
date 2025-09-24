import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContractAddresses {
  artistTipping?: string;
  musicNFTFactory?: string;
  eventTicketing?: string;
}

interface ContractDeployment {
  id: string;
  contract_name: string;
  contract_address: string;
  transaction_hash: string;
  block_number: number;
  gas_used: number;
  deployer_address: string;
  network: string;
  deployed_at: string;
}

export const useContractAddresses = () => {
  const [addresses, setAddresses] = useState<ContractAddresses>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContractAddresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contract_deployments')
        .select('*')
        .eq('network', 'base')
        .order('deployed_at', { ascending: false });

      if (error) throw error;

      // Get the latest deployment for each contract type
      const contractMap: ContractAddresses = {};
      data?.forEach((deployment: ContractDeployment) => {
        switch (deployment.contract_name) {
          case 'ArtistTipping':
            if (!contractMap.artistTipping) {
              contractMap.artistTipping = deployment.contract_address;
            }
            break;
          case 'MusicNFTFactory':
            if (!contractMap.musicNFTFactory) {
              contractMap.musicNFTFactory = deployment.contract_address;
            }
            break;
          case 'EventTicketing':
            if (!contractMap.eventTicketing) {
              contractMap.eventTicketing = deployment.contract_address;
            }
            break;
        }
      });

      setAddresses(contractMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contract addresses');
    } finally {
      setLoading(false);
    }
  };

  const deployContracts = async (deployerAddress: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('deploy-contracts', {
        body: {
          contracts: ['ArtistTipping', 'MusicNFTFactory', 'EventTicketing'],
          deployerAddress
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Refresh contract addresses after deployment
        await fetchContractAddresses();
        return data.deployments;
      } else {
        throw new Error(data?.error || 'Deployment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy contracts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractAddresses();
  }, []);

  return {
    addresses,
    loading,
    error,
    fetchContractAddresses,
    deployContracts,
    // Helper getters with fallbacks
    artistTippingAddress: addresses.artistTipping || '0x0000000000000000000000000000000000000000',
    musicNFTFactoryAddress: addresses.musicNFTFactory || '0x0000000000000000000000000000000000000000',
    eventTicketingAddress: addresses.eventTicketing || '0x0000000000000000000000000000000000000000',
  };
};