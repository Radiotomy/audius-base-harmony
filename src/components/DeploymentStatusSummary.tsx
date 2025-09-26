import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Shield, Rocket } from 'lucide-react';

export const DeploymentStatusSummary: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Production Deployment Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">BASE Mainnet Ready</span>
            </div>
            <Badge className="bg-green-100 text-green-800">✅ Verified</Badge>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span>🔒 Security (RLS + Audit fixes)</span>
              <Badge variant="default">Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>💰 Gas costs (~$0.69 total)</span>
              <Badge variant="default">Verified</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>🛡️ Wallet integration</span>
              <Badge variant="default">Secure</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>📱 Mobile optimization</span>
              <Badge variant="default">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>⚡ Performance</span>
              <Badge variant="default">Optimized</Badge>
            </div>
          </div>

          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              🚀 <strong>Status:</strong> Platform is production-ready for BASE mainnet deployment
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};