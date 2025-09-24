// NFT Marketplace - Discover and collect unique music NFTs
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNFTTokens, useNFTListings } from '@/hooks/useNFT';
import { Loader2, ShoppingCart, Eye, Music } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NFTWithDetails {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  creator_address: string;
  is_for_sale: boolean;
  royalty_percentage: number;
  track_id?: string;
}

export default function NFTMarketplace() {
  const [selectedNFT, setSelectedNFT] = useState<NFTWithDetails | null>(null);
  const { tokens, loading } = useNFTTokens();
  const { createListing } = useNFTListings();

  const handleBuyNFT = async (nft: NFTWithDetails) => {
    // TODO: Implement blockchain purchase logic
    console.log('Buying NFT:', nft);
  };

  const handleViewDetails = (nft: NFTWithDetails) => {
    setSelectedNFT(nft);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">NFT Marketplace</h1>
            <p className="text-xl text-muted-foreground">
              Discover and collect unique music NFTs from your favorite artists
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tokens.filter(token => token.is_for_sale).map((token) => (
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
                      {token.price && (
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-bold text-lg">{token.price} ETH</p>
                        </div>
                      )}
                      <Badge variant="secondary">
                        {token.royalty_percentage}% Royalty
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>Creator: {token.creator_address.slice(0, 6)}...{token.creator_address.slice(-4)}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(token)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {token.price && (
                        <Button
                          size="sm"
                          onClick={() => handleBuyNFT(token)}
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && tokens.filter(token => token.is_for_sale).length === 0 && (
            <div className="text-center py-12">
              <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No NFTs for sale</h3>
              <p className="text-muted-foreground">
                Check back later for new music NFTs from artists!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* NFT Details Modal */}
      <Dialog open={!!selectedNFT} onOpenChange={() => setSelectedNFT(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNFT?.name}</DialogTitle>
          </DialogHeader>
          {selectedNFT && (
            <div className="space-y-4">
              {selectedNFT.image_url && (
                <img
                  src={selectedNFT.image_url}
                  alt={selectedNFT.name}
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              )}
              
              {selectedNFT.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedNFT.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Creator</h4>
                  <p className="text-sm font-mono">
                    {selectedNFT.creator_address.slice(0, 10)}...{selectedNFT.creator_address.slice(-8)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Royalty</h4>
                  <p className="text-sm">{selectedNFT.royalty_percentage}%</p>
                </div>
              </div>

              {selectedNFT.price && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-2xl font-bold">{selectedNFT.price} ETH</p>
                    </div>
                    <Button onClick={() => handleBuyNFT(selectedNFT)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}