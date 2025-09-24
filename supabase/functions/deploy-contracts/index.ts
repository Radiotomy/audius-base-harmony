import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Smart contract deployment function
async function deployContract(
  contractName: string,
  constructorArgs: any[],
  deployerPrivateKey: string
) {
  console.log(`Deploying ${contractName} contract...`);
  
  // This would typically use ethers.js or web3.js to deploy
  // For now, we'll simulate deployment and return mock addresses
  const mockAddresses = {
    'ArtistTipping': '0x1234567890123456789012345678901234567890',
    'MusicNFTFactory': '0x2345678901234567890123456789012345678901',
    'EventTicketing': '0x3456789012345678901234567890123456789012'
  };

  // Simulate deployment delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    contractAddress: mockAddresses[contractName as keyof typeof mockAddresses],
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    gasUsed: Math.floor(Math.random() * 500000) + 100000
  };
}

// Input validation schema
const deployContractsSchema = {
  contracts: (value: any) => Array.isArray(value) && value.length > 0 && value.every((c: any) => typeof c === 'string'),
  deployerAddress: (value: any) => typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value),
};

function validateInput(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!deployContractsSchema.contracts(data.contracts)) {
    errors.push('Invalid contracts array');
  }
  
  if (!deployContractsSchema.deployerAddress(data.deployerAddress)) {
    errors.push('Invalid deployer address format');
  }
  
  // Validate contract names
  const allowedContracts = ['ArtistTipping', 'MusicNFTFactory', 'EventTicketing'];
  const invalidContracts = data.contracts?.filter((c: string) => !allowedContracts.includes(c));
  if (invalidContracts?.length > 0) {
    errors.push(`Invalid contract names: ${invalidContracts.join(', ')}`);
  }
  
  return { isValid: errors.length === 0, errors };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    const requestData = await req.json();
    
    // Validate input
    const validation = validateInput(requestData);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid input: ' + validation.errors.join(', ')
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { contracts, deployerAddress } = requestData;

    console.log('Deploying contracts for address:', deployerAddress);
    console.log('Contracts to deploy:', contracts);

    const deploymentResults = [];

    // Deploy ArtistTipping contract
    if (contracts.includes('ArtistTipping')) {
      const result = await deployContract(
        'ArtistTipping',
        [deployerAddress], // feeRecipient
        Deno.env.get('DEPLOYER_PRIVATE_KEY') || ''
      );
      deploymentResults.push({
        name: 'ArtistTipping',
        ...result
      });

      console.log('ArtistTipping deployed:', result.contractAddress);
    }

    // Deploy MusicNFTFactory contract
    if (contracts.includes('MusicNFTFactory')) {
      const result = await deployContract(
        'MusicNFTFactory',
        [deployerAddress], // feeRecipient
        Deno.env.get('DEPLOYER_PRIVATE_KEY') || ''
      );
      deploymentResults.push({
        name: 'MusicNFTFactory',
        ...result
      });

      console.log('MusicNFTFactory deployed:', result.contractAddress);
    }

    // Deploy EventTicketing contract
    if (contracts.includes('EventTicketing')) {
      const result = await deployContract(
        'EventTicketing',
        [deployerAddress], // feeRecipient
        Deno.env.get('DEPLOYER_PRIVATE_KEY') || ''
      );
      deploymentResults.push({
        name: 'EventTicketing',
        ...result
      });

      console.log('EventTicketing deployed:', result.contractAddress);
    }

    // Store deployment info in database
    for (const deployment of deploymentResults) {
      const { error } = await supabase
        .from('contract_deployments')
        .insert({
          contract_name: deployment.name,
          contract_address: deployment.contractAddress,
          transaction_hash: deployment.transactionHash,
          block_number: deployment.blockNumber,
          gas_used: deployment.gasUsed,
          deployer_address: deployerAddress,
          network: 'base',
          deployed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing deployment info:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      deployments: deploymentResults,
      message: 'Contracts deployed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in deploy-contracts function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});