import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Coins, Music, Sparkles } from 'lucide-react';
import { useNFTCollections, useNFTTokens } from '@/hooks/useNFT';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const mintSchema = z.object({
  collection_id: z.string().min(1, 'Collection is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  royalty_percentage: z.number().min(0, 'Royalty cannot be negative').max(25, 'Royalty cannot exceed 25%'),
});

type MintData = z.infer<typeof mintSchema>;

interface EnhancedNFTMintDialogProps {
  trackId?: string;
  trackTitle?: string;
  trackArtist?: string;
}

export const EnhancedNFTMintDialog: React.FC<EnhancedNFTMintDialogProps> = ({
  trackId,
  trackTitle,
  trackArtist,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<MintData>({
    collection_id: '',
    name: trackTitle || '',
    description: trackArtist ? `Music NFT by ${trackArtist}` : '',
    image_url: '',
    price: 0.01,
    royalty_percentage: 5,
  });

  const { collections, loading: collectionsLoading } = useNFTCollections();
  const { mintToken } = useNFTTokens();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      collection_id: '',
      name: trackTitle || '',
      description: trackArtist ? `Music NFT by ${trackArtist}` : '',
      image_url: '',
      price: 0.01,
      royalty_percentage: 5,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      });
      return;
    }

    try {
      const validatedData = mintSchema.parse(formData);
      setLoading(true);

      // Generate a unique token ID
      const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await mintToken({
        ...validatedData,
        token_id: tokenId,
        track_id: trackId,
        creator_address: address!,
        owner_address: address!,
        is_for_sale: !!validatedData.price && validatedData.price > 0,
      });

      toast({
        title: "NFT Minted Successfully! 🎉",
        description: `${validatedData.name} has been minted to your collection`,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Minting Failed",
          description: "Failed to mint NFT. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: keyof MintData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary">
          <Sparkles className="h-4 w-4 mr-2" />
          Mint NFT
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Mint Music NFT
          </DialogTitle>
          <DialogDescription>
            Create a unique NFT from your music and list it on the marketplace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Collection Selection */}
          <div className="space-y-2">
            <Label htmlFor="collection">Collection *</Label>
            <Select
              value={formData.collection_id}
              onValueChange={(value) => updateFormData('collection_id', value)}
            >
              <SelectTrigger className={errors.collection_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                {collectionsLoading ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading collections...
                  </SelectItem>
                ) : collections.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No collections found - create one first
                  </SelectItem>
                ) : (
                  collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        <span>{collection.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {collection.symbol}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.collection_id && (
              <p className="text-sm text-destructive">{errors.collection_id}</p>
            )}
          </div>

          <Separator />

          {/* NFT Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">NFT Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter NFT name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => updateFormData('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={errors.image_url ? 'border-destructive' : ''}
              />
              {errors.image_url && (
                <p className="text-sm text-destructive">{errors.image_url}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe your NFT..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <Separator />

          {/* Pricing & Royalties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (ETH)</Label>
              <Input
                id="price"
                type="number"
                step="0.001"
                min="0"
                value={formData.price || ''}
                onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                placeholder="0.01"
                className={errors.price ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Leave as 0 to mint without listing for sale
              </p>
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="royalty">Royalty Percentage</Label>
              <Input
                id="royalty"
                type="number"
                min="0"
                max="25"
                value={formData.royalty_percentage}
                onChange={(e) => updateFormData('royalty_percentage', parseInt(e.target.value) || 0)}
                placeholder="5"
                className={errors.royalty_percentage ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Percentage earned on secondary sales (max 25%)
              </p>
              {errors.royalty_percentage && (
                <p className="text-sm text-destructive">{errors.royalty_percentage}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Wallet Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Badge variant={isConnected ? "default" : "outline"}>
              {isConnected ? "Wallet Connected" : "Wallet Not Connected"}
            </Badge>
            {isConnected && address && (
              <span className="text-xs text-muted-foreground">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isConnected || loading || !formData.name || !formData.collection_id}
            className="w-full gradient-primary"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Minting NFT...' : 'Mint NFT'}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect your wallet to mint NFTs
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};