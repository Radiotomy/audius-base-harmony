import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SecurityIssue {
  level: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  resolved: boolean;
}

const SecurityDashboard: React.FC = () => {
  const securityIssues: SecurityIssue[] = [
    {
      level: 'high',
      title: 'Profile Data Protection',
      description: 'Wallet addresses and sensitive data now protected with enhanced RLS policies',
      resolved: true,
    },
    {
      level: 'high',
      title: 'Artist Tips Access Control',
      description: 'Tip data access restricted to verified participants only',
      resolved: true,
    },
    {
      level: 'medium',
      title: 'Input Validation',
      description: 'All user inputs now validated and sanitized using zod schemas',
      resolved: true,
    },
    {
      level: 'medium',
      title: 'Track Ownership',
      description: 'Audius track modifications restricted to verified owners',
      resolved: true,
    },
    {
      level: 'low',
      title: 'Public Profile Sanitization',
      description: 'Profile data sanitized for public viewing',
      resolved: true,
    },
  ];

  const getSecurityBadge = (level: string, resolved: boolean) => {
    if (resolved) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Fixed</Badge>;
    }
    
    switch (level) {
      case 'high':
        return <Badge variant="destructive">Critical</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSecurityIcon = (level: string, resolved: boolean) => {
    if (resolved) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    switch (level) {
      case 'high':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <Shield className="h-5 w-5 text-blue-600" />;
    }
  };

  const resolvedCount = securityIssues.filter(issue => issue.resolved).length;
  const totalCount = securityIssues.length;
  const securityScore = Math.round((resolvedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-green-600">{securityScore}%</h3>
              <p className="text-sm text-muted-foreground">Security Score</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{resolvedCount} of {totalCount} issues resolved</p>
              <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          {securityScore === 100 && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Excellent! All identified security issues have been resolved.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityIssues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getSecurityIcon(issue.level, issue.resolved)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{issue.title}</h4>
                    {getSecurityBadge(issue.level, issue.resolved)}
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Row Level Security (RLS) enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Input validation & sanitization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Secure authentication flow</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Protected sensitive data access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ownership verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Public data sanitization</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;