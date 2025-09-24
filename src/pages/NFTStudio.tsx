import { NFTCollectionManager } from "@/components/NFTCollectionManager";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNFTTokens } from '@/hooks/useNFT';
import { NFTMintDialog } from '@/components/NFTMintDialog';
import { Loader2, Music, Package, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function NFTStudio() {
  const { user } = useAuth();
  const { tokens, loading } = useNFTTokens();
  
  // Filter tokens owned by current user (this would need proper wallet integration)
  const myTokens = tokens.filter(token => 
    user && (token.creator_address === user.id || token.owner_address === user.id)
  );

  const totalValue = myTokens.reduce((sum, token) => sum + (token.price || 0), 0);
  const forSaleCount = myTokens.filter(token => token.is_for_sale).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">NFT Studio</h1>
            <p className="text-xl text-muted-foreground">
              Create, manage, and mint your music NFTs
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{myTokens.length}</p>
                    <p className="text-sm text-muted-foreground">Total NFTs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Coins className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{forSaleCount}</p>
                    <p className="text-sm text-muted-foreground">Listed for Sale</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Music className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalValue.toFixed(2)} ETH</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <NFTMintDialog />
          </div>

          {/* Collections Management */}
          <NFTCollectionManager />

          {/* My NFTs */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My NFTs</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myTokens.map((token) => (
                  <Card key={token.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      {token.image_url ? (
                        <img
                          src={token.image_url}
                          alt={token.name}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-3 flex items-center justify-center">
                          <Music className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <CardTitle className="text-lg line-clamp-2">{token.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {token.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {token.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {token.is_for_sale ? (
                            <Badge variant="default">For Sale</Badge>
                          ) : (
                            <Badge variant="secondary">Not Listed</Badge>
                          )}
                          <Badge variant="outline">
                            {token.royalty_percentage}% Royalty
                          </Badge>
                        </div>
                      </div>

                      {token.price && (
                        <div>
                          <p className="text-sm text-muted-foreground">Listed Price</p>
                          <p className="font-bold">{token.price} ETH</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                        {!token.is_for_sale && (
                          <Button size="sm" className="flex-1">
                            List for Sale
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && myTokens.length === 0 && (
              <div className="text-center py-12">
                <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No NFTs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first collection and start minting music NFTs!
                </p>
                <NFTMintDialog />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}