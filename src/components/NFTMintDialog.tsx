import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNFTCollections, useNFTTokens } from '@/hooks/useNFT';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { OnchainTransaction, createMintCalls } from './OnchainTransaction';
import { parseEther } from 'viem';

interface NFTMintDialogProps {
  trackId?: string;
  trackTitle?: string;
  trackArtist?: string;
}

export const NFTMintDialog = ({ trackId, trackTitle, trackArtist }: NFTMintDialogProps) => {
  const [open, setOpen] = useState(false);
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
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      collection_id: '',
      name: trackTitle || '',
      description: '',
      image_url: '',
      price: '',
      royalty_percentage: '5',
    });
  };

  const onMintSuccess = async (response: any) => {
    // Save to database after successful on-chain minting
    try {
      await mintToken({
        collection_id: formData.collection_id,
        token_id: `${Date.now()}`, // Temporary token ID
        track_id: trackId,
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        owner_address: address!,
        creator_address: address!,
        price: formData.price ? parseFloat(formData.price) : undefined,
        is_for_sale: !!formData.price,
        royalty_percentage: parseFloat(formData.royalty_percentage),
      });
      
      setOpen(false);
      resetForm();
      
      toast({
        title: "NFT Minted Successfully! 🎉",
        description: `${formData.name} has been minted to the blockchain`,
      });
    } catch (error) {
      console.error('Database save error:', error);
      toast({
        title: "Minted but database error",
        description: "NFT was minted but failed to save to database",
        variant: "destructive",
      });
    }
  };

  const onMintError = (error: Error) => {
    toast({
      title: "Minting Failed",
      description: error.message || "Failed to mint NFT",
      variant: "destructive",
    });
  };

  // Get selected collection for contract address
  const selectedCollection = collections.find(c => c.id === formData.collection_id);
  const mintCall = selectedCollection?.contract_address && address ? 
    createMintCalls(
      selectedCollection.contract_address as `0x${string}`,
      address,
      `${Date.now()}`,
      formData.price
    ) : null;

  const canMint = address && formData.collection_id && formData.name;

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
        <div className="space-y-4">
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

          {canMint && mintCall ? (
            <OnchainTransaction
              to={mintCall.to}
              value={mintCall.value}
              data={mintCall.data}
              onSuccess={onMintSuccess}
              onError={onMintError}
            >
              Mint NFT
            </OnchainTransaction>
          ) : (
            <Button disabled className="w-full">
              {!address
                ? 'Connect Wallet'
                : !formData.collection_id
                ? 'Select Collection'
                : !formData.name
                ? 'Enter NFT Name'
                : 'Mint NFT'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};