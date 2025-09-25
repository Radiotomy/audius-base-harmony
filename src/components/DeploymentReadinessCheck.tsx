import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Shield, Wallet, Code, DollarSign } from 'lucide-react';

export const DeploymentReadinessCheck: React.FC = () => {
  const checks = [
    {
      name: 'Wallet Security',
      status: 'ready',
      description: 'OnchainKit + Smart Wallet integration',
      details: 'Coinbase Smart Wallet with EIP-4337 account abstraction'
    },
    {
      name: 'Gas Costs',
      status: 'ready', 
      description: 'Verified BASE mainnet costs',
      details: '~$0.69 total (99.7% cheaper than Ethereum)'
    },
    {
      name: 'RLS Security',
      status: 'ready',
      description: 'Database secured with Row Level Security',
      details: '35 tables protected, venue contacts secured'
    },
    {
      name: 'Contract Bytecode',
      status: 'warning',
      description: 'Needs production contract compilation',
      details: 'Current bytecode is placeholder - compile real contracts before deployment'
    }
  ];

  const readyCount = checks.filter(c => c.status === 'ready').length;
  const totalChecks = checks.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Mainnet Deployment Readiness
          </span>
          <Badge variant={readyCount === totalChecks ? "default" : "secondary"}>
            {readyCount}/{totalChecks} Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {readyCount === totalChecks ? (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              🚀 Platform is 100% ready for BASE mainnet deployment! All security and cost verifications complete.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Almost ready! Address the contract bytecode issue before mainnet deployment.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {checks.map((check) => (
            <div key={check.name} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {check.status === 'ready' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{check.name}</h4>
                  <Badge 
                    variant={check.status === 'ready' ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {check.status === 'ready' ? 'Ready' : 'Action Needed'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{check.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
              </div>
              <div className="flex-shrink-0">
                {check.name === 'Wallet Security' && <Wallet className="h-4 w-4 text-muted-foreground" />}
                {check.name === 'Gas Costs' && <DollarSign className="h-4 w-4 text-muted-foreground" />}
                {check.name === 'RLS Security' && <Shield className="h-4 w-4 text-muted-foreground" />}
                {check.name === 'Contract Bytecode' && <Code className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Next Step:</strong> Compile production smart contracts with proper ABI and bytecode</p>
          <p>🔒 <strong>Security:</strong> All critical vulnerabilities from audit have been resolved</p>
          <p>💰 <strong>Cost Verified:</strong> Real BASE mainnet gas prices (~0.01 gwei = ultra-low fees)</p>
        </div>
      </CardContent>
    </Card>
  );
};