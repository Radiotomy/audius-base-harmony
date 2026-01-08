import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";
import { ethers } from "https://esm.sh/ethers@6.15.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ⚠️ PLACEHOLDER BYTECODE - COMPILE REAL CONTRACTS BEFORE PRODUCTION DEPLOYMENT ⚠️
// 
// To compile and get real bytecode:
// 1. Run: npx hardhat compile
// 2. Run: npx hardhat run scripts/compile-contracts.ts
// 3. Copy bytecode from generated compiled-contracts.ts file
// 4. Replace the placeholder strings below with real contract bytecode
//
// Or follow COMPILATION_GUIDE.md for detailed instructions
//
// Each bytecode string should start with "0x" and be several thousand characters long
const contractBytecodes = {
  'ArtistTipping': '0x608060405234801561001057600080fd5b506040516020806102238339810180604052602081101561003057600080fd5b5051600080546001600160a01b039092166001600160a01b0319909216919091179055610208806100626000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806312065fe01461003b5780638da5cb5b14610055575b600080fd5b610043610079565b60408051918252519081900360200190f35b61005d61007f565b604080516001600160a01b039092168252519081900360200190f35b60015490565b6000546001600160a01b031681565b600080546001600160a01b0316331461009057600080fd5b6040513390303180156108fc02916000818181858888f193505050501580156100bd573d6000803e3d6000fd5b5060015481016001555056fea265627a7a7231582012345678901234567890123456789012345678901234567890123456789064736f6c634300051100320000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001068656c6c6f20776f726c64000000000000000000000000000000000000000000',
  'MusicNFTFactory': '0x608060405234801561001057600080fd5b50604051602080610223833981018060405260208110156100305760008081fd5b5051600080546001600160a01b039092166001600160a01b0319909216919091179055610208806100626000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806312065fe01461003b5780638da5cb5b14610055575b600080fd5b610043610079565b60408051918252519081900360200190f35b61005d61007f565b604080516001600160a01b039092168252519081900360200190f35b60015490565b6000546001600160a01b031681565b600080546001600160a01b0316331461009057600080fd5b6040513390303180156108fc02916000818181858888f193505050501580156100bd573d6000803e3d6000fd5b5060015481016001555056fea265627a7a7231582012345678901234567890123456789012345678901234567890123456789064736f6c634300051100320000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001068656c6c6f20776f726c64000000000000000000000000000000000000000000',
  'EventTicketing': '0x608060405234801561001057600080fd5b50604051602080610223833981018060405260208110156100305760008081fd5b5051600080546001600160a01b039092166001600160a01b0319909216919091179055610208806100626000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806312065fe01461003b5780638da5cb5b14610055575b600080fd5b610043610079565b60408051918252519081900360200190f35b61005d61007f565b604080516001600160a01b039092168252519081900360200190f35b60015490565b6000546001600160a01b031681565b600080546001600160a01b0316331461009057600080fd5b6040513390303180156108fc02916000818181858888f193505050501580156100bd573d6000803e3d6000fd5b5060015481016001555056fea265627a7a7231582012345678901234567890123456789012345678901234567890123456789064736f6c634300051100320000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001068656c6c6f20776f726c64000000000000000000000000000000000000000000'
};

// Real smart contract deployment function
async function deployContract(
  contractName: string,
  constructorArgs: any[],
  deployerPrivateKey: string
) {
  console.log(`Deploying ${contractName} contract to Base network...`);
  
  try {
    // Base mainnet RPC endpoint
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);
    
    // Get contract bytecode
    const bytecode = contractBytecodes[contractName as keyof typeof contractBytecodes];
    if (!bytecode) {
      throw new Error(`Bytecode not found for contract ${contractName}`);
    }
    
    // Estimate gas price and limit
    const gasPrice = await provider.getFeeData();
    const deployTransaction = {
      data: bytecode,
      gasLimit: 3000000, // 3M gas limit
      gasPrice: gasPrice.gasPrice,
    };
    
    // Deploy contract
    console.log(`Sending deployment transaction for ${contractName}...`);
    const tx = await wallet.sendTransaction(deployTransaction);
    
    console.log(`Transaction hash: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed');
    }
    
    console.log(`${contractName} deployed successfully!`);
    console.log(`Contract address: ${receipt.contractAddress}`);
    console.log(`Block number: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    return {
      contractAddress: receipt.contractAddress,
      transactionHash: receipt.hash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: Number(receipt.gasUsed)
    };
    
  } catch (error) {
    console.error(`Error deploying ${contractName}:`, error);
    throw error;
  }
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

    // Deploy ArtistTipping contract (no constructor args - fee recipient is hardcoded)
    if (contracts.includes('ArtistTipping')) {
      const result = await deployContract(
        'ArtistTipping',
        [], // No constructor args - fee recipient hardcoded in contract
        Deno.env.get('DEPLOYER_PRIVATE_KEY') || ''
      );
      deploymentResults.push({
        name: 'ArtistTipping',
        ...result
      });

      console.log('ArtistTipping deployed:', result.contractAddress);
    }

    // Deploy MusicNFTFactory contract (no constructor args - fee recipient is hardcoded)
    if (contracts.includes('MusicNFTFactory')) {
      const result = await deployContract(
        'MusicNFTFactory',
        [], // No constructor args - fee recipient hardcoded in contract
        Deno.env.get('DEPLOYER_PRIVATE_KEY') || ''
      );
      deploymentResults.push({
        name: 'MusicNFTFactory',
        ...result
      });

      console.log('MusicNFTFactory deployed:', result.contractAddress);
    }

    // Deploy EventTicketing contract (no constructor args - fee recipient is hardcoded)
    if (contracts.includes('EventTicketing')) {
      const result = await deployContract(
        'EventTicketing',
        [], // No constructor args - fee recipient hardcoded in contract
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