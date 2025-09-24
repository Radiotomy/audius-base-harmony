import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Download,
  Eye,
  Heart,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TipRecord {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  transaction_hash?: string;
  wallet_address: string;
  status: string;
  created_at: string;
  confirmed_at?: string;
  user_id: string;
  usd_value?: number;
}

interface EarningsStats {
  totalTips: number;
  totalTipsUSD: number;
  tipCount: number;
  uniqueTippers: number;
  averageTip: number;
  thisMonthTips: number;
}

export const ArtistEarnings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalTips: 0,
    totalTipsUSD: 0,
    tipCount: 0,
    uniqueTippers: 0,
    averageTip: 0,
    thisMonthTips: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEarningsData();
    }
  }, [user]);

  const fetchEarningsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch tips where current user is the artist
      const { data: tipsData, error: tipsError } = await supabase
        .from('artist_tips')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (tipsError) throw tipsError;

      setTips(tipsData || []);

      // Calculate stats
      const confirmedTips = (tipsData || []).filter(tip => tip.status === 'confirmed');
      const totalTips = confirmedTips.reduce((sum, tip) => sum + tip.amount, 0);
      const totalTipsUSD = confirmedTips.reduce((sum, tip) => sum + (tip.usd_value || 0), 0);
      const uniqueTippers = new Set(confirmedTips.map(tip => tip.user_id)).size;
      const averageTip = confirmedTips.length > 0 ? totalTips / confirmedTips.length : 0;
      
      // This month tips
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthTips = confirmedTips.filter(tip => {
        const tipDate = new Date(tip.created_at);
        return tipDate.getMonth() === currentMonth && tipDate.getFullYear() === currentYear;
      }).reduce((sum, tip) => sum + tip.amount, 0);

      setStats({
        totalTips,
        totalTipsUSD,
        tipCount: confirmedTips.length,
        uniqueTippers,
        averageTip,
        thisMonthTips,
      });
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      toast({
        title: "Error loading earnings",
        description: "Could not load your earnings data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'ETH') {
      return `${amount.toFixed(6)} ETH`;
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Artist Earnings</h1>
            <p className="text-muted-foreground">
              Track your tips, earnings, and fan support
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tips (ETH)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTips.toFixed(6)}</div>
                <p className="text-xs text-muted-foreground">
                  ≈ ${stats.totalTipsUSD.toFixed(2)} USD
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tipCount}</div>
                <p className="text-xs text-muted-foreground">
                  From {stats.uniqueTippers} unique fans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Tip</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averageTip, 'ETH')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.thisMonthTips, 'ETH')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.thisMonthTips / stats.totalTips) * 100 || 0).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tips Table */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Tips</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tips</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-muted rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : tips.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No tips yet</h3>
                      <p className="text-muted-foreground">
                        Your tips will appear here when fans start supporting your music
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tips.map((tip) => (
                        <div
                          key={tip.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {tip.wallet_address.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {formatCurrency(tip.amount, tip.currency)}
                                </span>
                                <Badge variant={getStatusColor(tip.status)}>
                                  {tip.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {tip.wallet_address.slice(0, 8)}...{tip.wallet_address.slice(-6)}
                              </p>
                              {tip.message && (
                                <p className="text-sm mt-1 italic">"{tip.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(tip.created_at).toLocaleDateString()}
                            </p>
                            {tip.transaction_hash && (
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    {tips.filter(tip => tip.status === 'confirmed').map((tip) => (
                      <div
                        key={tip.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Zap className="h-5 w-5 text-green-500" />
                          <div>
                            <div className="font-medium">
                              {formatCurrency(tip.amount, tip.currency)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Confirmed on {new Date(tip.confirmed_at || tip.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    {tips.filter(tip => tip.status === 'pending').map((tip) => (
                      <div
                        key={tip.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Clock className="h-5 w-5 text-yellow-500" />
                          <div>
                            <div className="font-medium">
                              {formatCurrency(tip.amount, tip.currency)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Pending confirmation...
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};