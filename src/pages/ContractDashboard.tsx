import React from 'react';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/MobileNavigation';
import WalletConnect from '@/components/OnchainWallet';
import { ContractDeployment } from '@/components/ContractDeployment';
import { BaseEcosystemIntegration } from '@/components/BaseEcosystemIntegration';
import { FarcasterFrames } from '@/components/FarcasterFrames';
import { DeploymentReadinessCheck } from '@/components/DeploymentReadinessCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Coins, Wallet, Network, Ticket } from 'lucide-react';

const ContractDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AudioBASE Launch Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Deploy contracts, integrate Base ecosystem features, and launch your music platform 
              with gasless transactions, social frames, and onchain identity.
            </p>
          </div>

          <BaseEcosystemIntegration />

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Artist Tipping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable fans to tip artists directly with ETH. Gasless with Paymaster integration.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Platform Fee:</span>
                    <span>1%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Gas Sponsored:</span>
                    <span className="text-green-500">Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Music NFTs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create music NFTs with Farcaster Frames for viral distribution and social minting.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Royalties:</span>
                    <span>5-10%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Social Minting:</span>
                    <span className="text-green-500">Enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Event Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Issue blockchain tickets with Base Names integration for seamless UX.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Standard:</span>
                    <span>ERC-1155</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Base Names:</span>
                    <span className="text-green-500">Supported</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WalletConnect />
                </CardContent>
              </Card>

              <FarcasterFrames />
            </div>

            <div className="space-y-6">
              <DeploymentReadinessCheck />
              <ContractDeployment />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Base Ecosystem Launch Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Technical Advantages</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• $100 gas credits via Paymaster</li>
                  <li>• 10-100x cheaper than Ethereum</li>
                  <li>• 2-second confirmation times</li>
                  <li>• ~$0.30 total deployment cost</li>
                  <li>• Coinbase Smart Wallet integration</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Social & Identity</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Base Names (.base domains)</li>
                  <li>• Farcaster Frames integration</li>
                  <li>• Social music discovery</li>
                  <li>• Viral NFT minting</li>
                  <li>• Cross-platform identity</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Growth & Marketing</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 130M+ Coinbase users</li>
                  <li>• Base App Directory listing</li>
                  <li>• Ecosystem funding access</li>
                  <li>• Builder Network community</li>
                  <li>• Onchain Summer campaigns</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractDashboard;