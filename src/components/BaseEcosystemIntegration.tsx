import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Zap, 
  Users, 
  Award, 
  Coins, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { usePaymaster } from '@/hooks/usePaymaster';
import { useBaseNames } from '@/hooks/useBaseNames';

interface IntegrationStatus {
  paymaster: 'active' | 'pending' | 'inactive';
  baseNames: 'registered' | 'available' | 'pending';
  farcaster: 'connected' | 'disconnected';
  baseApp: 'listed' | 'pending' | 'not_submitted';
}

export const BaseEcosystemIntegration: React.FC = () => {
  const { address } = useAccount();
  const { isEnabled: paymasterEnabled, toggleSponsorship } = usePaymaster();
  const { hasBaseName, name: baseName, registerBaseName } = useBaseNames();
  
  const [status, setStatus] = useState<IntegrationStatus>({
    paymaster: paymasterEnabled ? 'active' : 'inactive',
    baseNames: hasBaseName ? 'registered' : 'available',
    farcaster: 'disconnected',
    baseApp: 'not_submitted'
  });

  const [registrationName, setRegistrationName] = useState('');

  const integrations = [
    {
      id: 'paymaster',
      title: 'Coinbase Paymaster',
      description: 'Gasless transactions for new users',
      icon: Zap,
      status: status.paymaster,
      benefits: ['$100 gas credits', 'Zero friction onboarding', 'Higher conversion rates'],
      action: toggleSponsorship,
      actionText: status.paymaster === 'active' ? 'Disable' : 'Enable'
    },
    {
      id: 'baseNames',
      title: 'Base Names',
      description: 'Onchain identity with .base domains',
      icon: Users,
      status: status.baseNames,
      benefits: ['Human-readable addresses', 'Social identity', 'Cross-app recognition'],
      action: () => handleBaseNameRegistration(),
      actionText: hasBaseName ? 'Registered' : 'Register'
    },
    {
      id: 'farcaster',
      title: 'Farcaster Frames',
      description: 'Social music sharing with embedded actions',
      icon: Shield,
      status: status.farcaster,
      benefits: ['Viral music discovery', 'Social tipping', 'Interactive NFT minting'],
      action: () => connectFarcaster(),
      actionText: 'Connect'
    },
    {
      id: 'baseApp',
      title: 'Base App Directory',
      description: 'Official Base ecosystem listing',
      icon: Award,
      status: status.baseApp,
      benefits: ['Increased visibility', 'Trust signals', 'Ecosystem support'],
      action: () => submitToBaseApp(),
      actionText: 'Submit App'
    }
  ];

  const handleBaseNameRegistration = async () => {
    if (!registrationName) {
      toast.error('Please enter a Base name to register');
      return;
    }

    try {
      await registerBaseName(registrationName);
      setStatus(prev => ({ ...prev, baseNames: 'pending' }));
      toast.success('Base name registration initiated!');
    } catch (error) {
      toast.error('Failed to register Base name');
    }
  };

  const connectFarcaster = async () => {
    try {
      // Integrate with Farcaster Connect
      const response = await fetch('/api/farcaster/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (response.ok) {
        setStatus(prev => ({ ...prev, farcaster: 'connected' }));
        toast.success('Farcaster connected successfully!');
      }
    } catch (error) {
      toast.error('Failed to connect Farcaster');
    }
  };

  const submitToBaseApp = async () => {
    try {
      window.open('https://base.org/ecosystem/submit', '_blank');
      setStatus(prev => ({ ...prev, baseApp: 'pending' }));
    } catch (error) {
      toast.error('Failed to open submission form');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'registered':
      case 'connected':
      case 'listed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'registered':
      case 'connected':
      case 'listed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const completedIntegrations = integrations.filter(i => 
    ['active', 'registered', 'connected', 'listed'].includes(i.status)
  ).length;
  
  const completionPercentage = (completedIntegrations / integrations.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Base Ecosystem Integration
            <Badge variant="outline">
              {completedIntegrations}/{integrations.length} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Integration Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => {
                const IconComponent = integration.icon;
                const isCompleted = ['active', 'registered', 'connected', 'listed'].includes(integration.status);
                
                return (
                  <Card key={integration.id} className="relative">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {integration.title}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(integration.status)}
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                        </div>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold mb-1">Benefits:</h4>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {integration.benefits.map((benefit, index) => (
                              <li key={index}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>

                        {integration.id === 'baseNames' && !hasBaseName && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="yourname.base"
                              value={registrationName}
                              onChange={(e) => setRegistrationName(e.target.value)}
                              className="w-full px-3 py-2 text-xs border rounded-md"
                            />
                          </div>
                        )}

                        <Button
                          onClick={integration.action}
                          disabled={isCompleted}
                          size="sm"
                          className="w-full"
                          variant={isCompleted ? "outline" : "default"}
                        >
                          {integration.actionText}
                          {integration.id === 'baseApp' && (
                            <ExternalLink className="h-3 w-3 ml-2" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {baseName && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Your Base Name: {baseName}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};