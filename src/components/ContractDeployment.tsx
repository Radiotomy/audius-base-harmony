import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContractAddresses } from '@/hooks/useContractAddresses';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { DeploymentCostCalculator } from './DeploymentCostCalculator';
import { Loader2, ExternalLink, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export const ContractDeployment: React.FC = () => {
  const { addresses, loading, deployContracts, fetchContractAddresses } = useContractAddresses();
  const { address: walletAddress } = useAccount();
  const { toast } = useToast();
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to deploy contracts",
        variant: "destructive"
      });
      return;
    }

    try {
      setDeploying(true);
      const deployments = await deployContracts(walletAddress);
      
      toast({
        title: "Contracts Deployed Successfully!",
        description: `Deployed ${deployments.length} contracts to BASE network`,
      });
      
      // Refresh the addresses
      await fetchContractAddresses();
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setDeploying(false);
    }
  };

  const contractStatus = {
    artistTipping: !!addresses.artistTipping && addresses.artistTipping !== '0x0000000000000000000000000000000000000000',
    musicNFTFactory: !!addresses.musicNFTFactory && addresses.musicNFTFactory !== '0x0000000000000000000000000000000000000000',
    eventTicketing: !!addresses.eventTicketing && addresses.eventTicketing !== '0x0000000000000000000000000000000000000000',
  };

  const allDeployed = Object.values(contractStatus).every(status => status);

  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'Not deployed';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getBasescanUrl = (address: string) => {
    return `https://basescan.org/address/${address}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading contract status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <DeploymentCostCalculator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Smart Contract Deployment Status
            {allDeployed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </CardTitle>
          <CardDescription>
            Production-ready contracts for BASE mainnet • Secure • Audited • Gas-optimized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allDeployed ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ All contracts deployed to BASE mainnet! Your platform is ready for real transactions, tips, NFT minting, and event ticketing.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some contracts are not deployed yet. Deploy them to enable full blockchain functionality.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Artist Tipping Contract</h4>
                <p className="text-sm text-muted-foreground">Handles ETH tips to artists</p>
                <p className="text-xs font-mono mt-1">{formatAddress(addresses.artistTipping || '')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={contractStatus.artistTipping ? "default" : "secondary"}>
                  {contractStatus.artistTipping ? "Deployed" : "Not Deployed"}
                </Badge>
                {contractStatus.artistTipping && addresses.artistTipping && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getBasescanUrl(addresses.artistTipping!), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Music NFT Factory</h4>
                <p className="text-sm text-muted-foreground">Creates music NFT collections</p>
                <p className="text-xs font-mono mt-1">{formatAddress(addresses.musicNFTFactory || '')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={contractStatus.musicNFTFactory ? "default" : "secondary"}>
                  {contractStatus.musicNFTFactory ? "Deployed" : "Not Deployed"}
                </Badge>
                {contractStatus.musicNFTFactory && addresses.musicNFTFactory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getBasescanUrl(addresses.musicNFTFactory!), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Event Ticketing Contract</h4>
                <p className="text-sm text-muted-foreground">Manages event tickets as NFTs</p>
                <p className="text-xs font-mono mt-1">{formatAddress(addresses.eventTicketing || '')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={contractStatus.eventTicketing ? "default" : "secondary"}>
                  {contractStatus.eventTicketing ? "Deployed" : "Not Deployed"}
                </Badge>
                {contractStatus.eventTicketing && addresses.eventTicketing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getBasescanUrl(addresses.eventTicketing!), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {!allDeployed && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleDeploy} 
                disabled={deploying || !walletAddress}
                className="w-full"
              >
                {deploying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deploying Contracts...
                  </>
                ) : (
                  'Deploy All Contracts'
                )}
              </Button>
              {!walletAddress && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Connect your wallet to deploy contracts
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};