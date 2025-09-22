import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Link, Unlink, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/contexts/Web3Context';
import { useSolana } from '@/contexts/SolanaContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WalletBinding {
  wallet_type: 'ethereum' | 'solana';
  wallet_address: string;
  created_at: string;
}

const Web3AuthIntegration = () => {
  const { user } = useAuth();
  const web3 = useWeb3();
  const solana = useSolana();
  const { toast } = useToast();
  const [bindings, setBindings] = useState<WalletBinding[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing wallet bindings
  const fetchBindings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallet_bindings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBindings((data || []) as WalletBinding[]);
    } catch (error) {
      console.error('Error fetching wallet bindings:', error);
    }
  };

  useEffect(() => {
    fetchBindings();
  }, [user]);

  const linkWallet = async (type: 'ethereum' | 'solana', address: string) => {
    if (!user) return;

    // Check if wallet is already linked to another account
    const { data: existingBinding, error: checkError } = await supabase
      .from('wallet_bindings')
      .select('user_id')
      .eq('wallet_address', address)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      toast({
        title: "Error",
        description: "Failed to check wallet binding status",
        variant: "destructive",
      });
      return;
    }

    if (existingBinding && existingBinding.user_id !== user.id) {
      toast({
        title: "Wallet Already Linked",
        description: "This wallet is already linked to another account",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wallet_bindings')
        .upsert({
          user_id: user.id,
          wallet_type: type,
          wallet_address: address,
        }, {
          onConflict: 'user_id,wallet_address'
        });

      if (error) throw error;

      await fetchBindings();
      toast({
        title: "Wallet Linked",
        description: `${type === 'ethereum' ? 'Ethereum' : 'Solana'} wallet linked successfully`,
      });
    } catch (error: any) {
      console.error('Error linking wallet:', error);
      toast({
        title: "Linking Failed",
        description: error.message || "Failed to link wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unlinkWallet = async (address: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wallet_bindings')
        .delete()
        .eq('user_id', user.id)
        .eq('wallet_address', address);

      if (error) throw error;

      await fetchBindings();
      toast({
        title: "Wallet Unlinked",
        description: "Wallet has been unlinked from your account",
      });
    } catch (error: any) {
      console.error('Error unlinking wallet:', error);
      toast({
        title: "Unlinking Failed",
        description: error.message || "Failed to unlink wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isWalletLinked = (address: string) => {
    return bindings.some(b => b.wallet_address === address);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Please sign in to manage wallet connections
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Web3 Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ethereum Wallet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Ethereum Wallet</h4>
            {web3.isConnected && (
              <Badge variant={isWalletLinked(web3.account!) ? 'default' : 'secondary'}>
                {isWalletLinked(web3.account!) ? 'Linked' : 'Connected'}
              </Badge>
            )}
          </div>

          {web3.isConnected ? (
            <div className="flex items-center gap-3">
              <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                {web3.account?.slice(0, 6)}...{web3.account?.slice(-4)}
              </code>
              
              {!isWalletLinked(web3.account!) ? (
                <Button
                  size="sm"
                  onClick={() => linkWallet('ethereum', web3.account!)}
                  disabled={loading}
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-1" />
                      Link
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unlinkWallet(web3.account!)}
                  disabled={loading}
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Unlink className="h-4 w-4 mr-1" />
                      Unlink
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect your Ethereum wallet to link it to your account
            </p>
          )}
        </div>

        {/* Solana Wallet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Solana Wallet</h4>
            {solana.connected && (
              <Badge variant={isWalletLinked(solana.publicKey?.toString() || '') ? 'default' : 'secondary'}>
                {isWalletLinked(solana.publicKey?.toString() || '') ? 'Linked' : 'Connected'}
              </Badge>
            )}
          </div>

          {solana.connected && solana.publicKey ? (
            <div className="flex items-center gap-3">
              <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                {solana.publicKey.toString().slice(0, 6)}...{solana.publicKey.toString().slice(-4)}
              </code>
              
              {!isWalletLinked(solana.publicKey.toString()) ? (
                <Button
                  size="sm"
                  onClick={() => linkWallet('solana', solana.publicKey!.toString())}
                  disabled={loading}
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-1" />
                      Link
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unlinkWallet(solana.publicKey!.toString())}
                  disabled={loading}
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Unlink className="h-4 w-4 mr-1" />
                      Unlink
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect your Solana wallet to link it to your account
            </p>
          )}
        </div>

        {/* Linked Wallets Summary */}
        {bindings.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Linked Wallets</h4>
            <div className="space-y-2">
              {bindings.map((binding) => (
                <div key={binding.wallet_address} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {binding.wallet_type}
                    </Badge>
                    <code className="text-xs">
                      {binding.wallet_address.slice(0, 6)}...{binding.wallet_address.slice(-4)}
                    </code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => unlinkWallet(binding.wallet_address)}
                    disabled={loading}
                  >
                    <Unlink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Web3AuthIntegration;