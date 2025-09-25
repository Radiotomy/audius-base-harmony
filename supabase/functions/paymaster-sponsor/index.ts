import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SponsorRequest {
  userAddress: string;
  contractAddress: string;
  functionName: string;
  args: any[];
  value?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    const requestData: SponsorRequest = await req.json();
    
    const { userAddress, contractAddress, functionName, args, value } = requestData;
    
    // Validate request
    if (!userAddress || !contractAddress || !functionName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing paymaster sponsorship request for:', userAddress);
    console.log('Contract:', contractAddress, 'Function:', functionName);

    // Check if user is eligible for gas sponsorship
    const eligibilityResponse = await checkEligibility(userAddress, supabase);
    
    if (!eligibilityResponse.eligible) {
      return new Response(JSON.stringify({
        success: false,
        sponsored: false,
        error: eligibilityResponse.reason
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Estimate gas cost
    const gasEstimate = await estimateGasCost(contractAddress, functionName, args, value);
    
    // Check if gas cost is within sponsorship limits
    const maxSponsorableGas = parseFloat(Deno.env.get('MAX_SPONSORABLE_GAS') || '0.01'); // 0.01 ETH max
    
    if (gasEstimate > maxSponsorableGas) {
      return new Response(JSON.stringify({
        success: false,
        sponsored: false,
        error: 'Transaction gas cost exceeds sponsorship limit'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Approve sponsorship via Coinbase Paymaster API
    const sponsorshipResult = await requestSponsorship({
      userAddress,
      contractAddress,
      functionName,
      args,
      value,
      gasEstimate
    });

    // Log sponsorship for analytics
    await logSponsorship(supabase, {
      user_address: userAddress,
      contract_address: contractAddress,
      function_name: functionName,
      gas_estimate: gasEstimate,
      sponsored: sponsorshipResult.sponsored,
      transaction_hash: sponsorshipResult.transactionHash || null
    });

    return new Response(JSON.stringify({
      success: true,
      sponsored: sponsorshipResult.sponsored,
      transactionHash: sponsorshipResult.transactionHash,
      gasEstimate: gasEstimate
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing paymaster request:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function checkEligibility(userAddress: string, supabase: any) {
  try {
    // Check user's sponsorship usage in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: recentSponsorships, error } = await supabase
      .from('paymaster_logs')
      .select('gas_estimate')
      .eq('user_address', userAddress)
      .eq('sponsored', true)
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    if (error) {
      console.error('Error checking eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
    
    // Calculate total gas used in last 24 hours
    const totalGasUsed = recentSponsorships?.reduce((sum: number, log: any) => sum + log.gas_estimate, 0) || 0;
    const dailyLimit = parseFloat(Deno.env.get('DAILY_GAS_LIMIT') || '0.1'); // 0.1 ETH daily limit
    
    if (totalGasUsed >= dailyLimit) {
      return { 
        eligible: false, 
        reason: 'Daily gas sponsorship limit exceeded' 
      };
    }
    
    return { eligible: true, reason: null };
  } catch (error) {
    console.error('Error in eligibility check:', error);
    return { eligible: false, reason: 'Eligibility check failed' };
  }
}

async function estimateGasCost(contractAddress: string, functionName: string, args: any[], value?: string) {
  // Simplified gas estimation - in production, this would use actual contract calls
  const gasEstimates = {
    'tipArtist': 0.002, // 0.002 ETH
    'mint': 0.005,      // 0.005 ETH
    'purchaseTickets': 0.003, // 0.003 ETH
    'default': 0.001    // 0.001 ETH
  };
  
  return gasEstimates[functionName as keyof typeof gasEstimates] || gasEstimates.default;
}

async function requestSponsorship(params: {
  userAddress: string;
  contractAddress: string;
  functionName: string;
  args: any[];
  value?: string;
  gasEstimate: number;
}) {
  try {
    // This would integrate with Coinbase Paymaster API
    // For now, we'll simulate approval based on function type
    const eligibleFunctions = ['tipArtist', 'mint', 'purchaseTickets'];
    
    if (eligibleFunctions.includes(params.functionName)) {
      return {
        sponsored: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };
    }
    
    return { sponsored: false };
  } catch (error) {
    console.error('Error requesting sponsorship:', error);
    return { sponsored: false };
  }
}

async function logSponsorship(supabase: any, logData: any) {
  try {
    const { error } = await supabase
      .from('paymaster_logs')
      .insert(logData);
    
    if (error) {
      console.error('Error logging sponsorship:', error);
    }
  } catch (error) {
    console.error('Error in log function:', error);
  }
}