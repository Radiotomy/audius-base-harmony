import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNFTCollections, useNFTTokens } from '@/hooks/useNFT';
import { useAccount } from 'wagmi';
import { Loader2, Plus } from 'lucide-react';

interface NFTMintDialogProps {
  trackId?: string;
  trackTitle?: string;
  trackArtist?: string;
}

export const NFTMintDialog = ({ trackId, trackTitle, trackArtist }: NFTMintDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    collection_id: '',
    name: trackTitle || '',
    description: '',
    image_url: '',
    price: '',
    royalty_percentage: '5',
  });

  const { collections } = useNFTCollections();
  const { mintToken } = useNFTTokens();
  const { address } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      await mintToken({
        collection_id: formData.collection_id,
        token_id: `${Date.now()}`, // Temporary token ID
        track_id: trackId,
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        owner_address: address,
        creator_address: address,
        price: formData.price ? parseFloat(formData.price) : undefined,
        is_for_sale: !!formData.price,
        royalty_percentage: parseFloat(formData.royalty_percentage),
      });
      
      setOpen(false);
      setFormData({
        collection_id: '',
        name: trackTitle || '',
        description: '',
        image_url: '',
        price: '',
        royalty_percentage: '5',
      });
    } catch (error) {
      console.error('Minting error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Mint NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mint Music NFT</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Collection</Label>
            <Select
              value={formData.collection_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, collection_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name} ({collection.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">NFT Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter NFT name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your NFT"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (ETH) - Optional</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="royalty">Royalty Percentage</Label>
            <Input
              id="royalty"
              type="number"
              min="0"
              max="50"
              value={formData.royalty_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, royalty_percentage: e.target.value }))}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !formData.collection_id || !formData.name || !address}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              'Mint NFT'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};