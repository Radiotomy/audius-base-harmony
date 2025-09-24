import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Heart,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface EarningsWidgetStats {
  totalTips: number;
  totalTipsUSD: number;
  tipCount: number;
  thisWeekTips: number;
  recentTips: Array<{
    id: string;
    amount: number;
    currency: string;
    created_at: string;
    status: string;
  }>;
}

export const ArtistEarningsWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<EarningsWidgetStats>({
    totalTips: 0,
    totalTipsUSD: 0,
    tipCount: 0,
    thisWeekTips: 0,
    recentTips: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEarningsStats();
    }
  }, [user]);

  const fetchEarningsStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch recent tips for current user as artist
      const { data: tipsData, error } = await supabase
        .from('artist_tips')
        .select('id, amount, currency, created_at, status, usd_value')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const confirmedTips = (tipsData || []).filter(tip => tip.status === 'confirmed');
      const totalTips = confirmedTips.reduce((sum, tip) => sum + tip.amount, 0);
      const totalTipsUSD = confirmedTips.reduce((sum, tip) => sum + (tip.usd_value || 0), 0);
      
      // This week tips
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekTips = confirmedTips.filter(tip => 
        new Date(tip.created_at) >= oneWeekAgo
      ).reduce((sum, tip) => sum + tip.amount, 0);

      setStats({
        totalTips,
        totalTipsUSD,
        tipCount: confirmedTips.length,
        thisWeekTips,
        recentTips: tipsData || [],
      });
    } catch (error) {
      console.error('Error fetching earnings stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'ETH') {
      return `${amount.toFixed(4)} ETH`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Overview
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/artist-earnings')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalTips, 'ETH')}
            </div>
            <p className="text-sm text-muted-foreground">Total Tips</p>
            <p className="text-xs text-muted-foreground">
              ≈ ${stats.totalTipsUSD.toFixed(2)} USD
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.tipCount}</div>
            <p className="text-sm text-muted-foreground">Total Tips</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">
                {formatCurrency(stats.thisWeekTips, 'ETH')} this week
              </span>
            </div>
          </div>
        </div>

        {/* Recent Tips */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Tips</h4>
          {stats.recentTips.length === 0 ? (
            <div className="text-center py-4">
              <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No tips yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentTips.map((tip) => (
                <div
                  key={tip.id}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {tip.status === 'confirmed' ? (
                      <Zap className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse" />
                    )}
                    <div>
                      <div className="font-medium text-sm">
                        {formatCurrency(tip.amount, tip.currency)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(tip.status)} className="text-xs">
                    {tip.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate('/artist-earnings')}
          >
            View Full Earnings Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};