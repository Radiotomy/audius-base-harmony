import React from 'react';
import { ContractDeployment } from '@/components/ContractDeployment';
import WalletConnect from '@/components/OnchainWallet';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/MobileNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Coins, Code } from 'lucide-react';

const ContractDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MobileNavigation />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Smart Contract Dashboard</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deploy and manage AudioBASE smart contracts on BASE network. 
              Enable real blockchain transactions for tipping, NFTs, and event ticketing.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Artist Tipping</CardTitle>
                <CardDescription>
                  Direct ETH tips to artists with minimal fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <Badge variant="secondary">1%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Sponsored:</span>
                    <Badge variant="default">Yes</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Music NFTs</CardTitle>
                <CardDescription>
                  Create and trade music NFT collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Standard:</span>
                    <Badge variant="secondary">ERC-721</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Royalties:</span>
                    <Badge variant="default">Up to 10%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Coins className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Event Tickets</CardTitle>
                <CardDescription>
                  NFT-based event ticketing system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Standard:</span>
                    <Badge variant="secondary">ERC-1155</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Resale:</span>
                    <Badge variant="default">Built-in</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Connection */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
              <CardDescription>
                Connect your wallet to deploy and interact with smart contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>

          {/* Contract Deployment */}
          <ContractDeployment />

          {/* Network Info */}
          <Card>
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
              <CardDescription>
                AudioBASE is built on BASE - Coinbase's L2 solution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Network Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Low transaction fees (~$0.01)</li>
                    <li>• Fast confirmation times (~2 seconds)</li>
                    <li>• Ethereum ecosystem compatibility</li>
                    <li>• Coinbase ecosystem integration</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Contract Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Gas sponsorship for users</li>
                    <li>• Built-in royalty management</li>
                    <li>• Emergency pause functionality</li>
                    <li>• Upgradeable proxy patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ContractDashboard;