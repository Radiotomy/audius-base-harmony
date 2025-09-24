import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Zap, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  transaction_hash: string;
  amount: number;
  currency: string;
  artist_name: string;
  status: string;
  created_at: string;
  confirmed_at?: string;
  message?: string;
}

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const fetchTransactions = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('artist_tips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <ArrowUpRight className="h-3 w-3" />;
      case 'pending': return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'failed': return <ArrowDownLeft className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Your recent tips and transactions on Base network
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchTransactions}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start tipping artists to see your transaction history
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {getStatusIcon(tx.status)}
                    </div>
                    <div>
                      <p className="font-medium">
                        Tip to {tx.artist_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM d, h:mm a')}
                      </p>
                      {tx.message && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          "{tx.message}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <p className="font-semibold">
                        {tx.amount} {tx.currency}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(tx.status)}`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    {tx.transaction_hash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => 
                          window.open(
                            `https://basescan.org/tx/${tx.transaction_hash}`,
                            '_blank'
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};