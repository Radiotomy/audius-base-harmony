import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNFTCollections } from '@/hooks/useNFT';
import { Loader2, Plus, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const NFTCollectionManager = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbol: '',
    max_supply: '',
    royalty_percentage: '5',
  });

  const { collections, createCollection, loading: collectionsLoading } = useNFTCollections();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createCollection({
        name: formData.name,
        description: formData.description,
        symbol: formData.symbol.toUpperCase(),
        max_supply: formData.max_supply ? parseInt(formData.max_supply) : undefined,
        royalty_percentage: parseFloat(formData.royalty_percentage),
        network: 'base',
        is_active: true,
      });
      
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        symbol: '',
        max_supply: '',
        royalty_percentage: '5',
      });
    } catch (error) {
      console.error('Collection creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">NFT Collections</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create NFT Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Music Collection"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  placeholder="MUSIC"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your collection"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSupply">Max Supply (Optional)</Label>
                <Input
                  id="maxSupply"
                  type="number"
                  min="1"
                  value={formData.max_supply}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_supply: e.target.value }))}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="royalty">Royalty Percentage</Label>
                <Input
                  id="royalty"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={formData.royalty_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, royalty_percentage: e.target.value }))}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.name || !formData.symbol}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Collection'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {collectionsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {collection.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{collection.symbol}</Badge>
                  <Badge variant="outline">{collection.network}</Badge>
                </div>
                
                {collection.description && (
                  <p className="text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Supply:</span>
                    <p className="font-medium">
                      {collection.current_supply}
                      {collection.max_supply && ` / ${collection.max_supply}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Royalty:</span>
                    <p className="font-medium">{collection.royalty_percentage}%</p>
                  </div>
                </div>

                {collection.contract_address && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Contract:</span>
                    <p className="font-mono text-xs break-all">
                      {collection.contract_address}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};