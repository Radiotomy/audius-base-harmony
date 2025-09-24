import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Package,
  DollarSign,
  Image
} from 'lucide-react';
import { useMerchandise } from '@/hooks/useMerchandise';
import { useMerchImageUpload } from '@/hooks/useFileUpload';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const merchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.enum(['ETH', 'USD']),
  inventory_count: z.number().min(0, 'Inventory must be 0 or greater').optional(),
});

type MerchandiseFormData = z.infer<typeof merchSchema>;

const MERCH_CATEGORIES = [
  { label: 'T-Shirts', value: 'clothing' },
  { label: 'Hoodies', value: 'clothing' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Bags', value: 'accessories' },
  { label: 'Hats', value: 'accessories' },
  { label: 'Vinyl Records', value: 'vinyl' },
  { label: 'CDs', value: 'vinyl' },
  { label: 'Digital Downloads', value: 'digital' },
  { label: 'Posters', value: 'other' },
  { label: 'Stickers', value: 'other' },
  { label: 'Collectibles', value: 'other' }
];

export const MerchandiseManager = () => {
  const { merchItems, loading, createMerchItem, updateMerchItem, deleteMerchItem, toggleMerchActiveStatus } = useMerchandise();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const merchImageUpload = useMerchImageUpload();

  const form = useForm<MerchandiseFormData>({
    resolver: zodResolver(merchSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      currency: 'ETH',
      inventory_count: 0,
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = form;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: MerchandiseFormData) => {
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        for (const image of images) {
          const result = await merchImageUpload.uploadFile(image);
          if (result?.url) {
            imageUrls.push(result.url);
          }
        }
      }

      const merchData = {
        ...data,
        images: imageUrls,
        category: data.category as 'clothing' | 'accessories' | 'vinyl' | 'digital' | 'other',
      };

      if (selectedItem) {
        await updateMerchItem({ id: selectedItem.id, ...merchData });
      } else {
        await createMerchItem(merchData);
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving merchandise:', error);
    }
  };

  const resetForm = () => {
    reset();
    setSelectedItem(null);
    setImages([]);
    setImagePreviews([]);
  };

  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setValue('name', item.name);
    setValue('description', item.description || '');
    setValue('category', item.category);
    setValue('price', item.price);
    setValue('currency', item.currency);
    setValue('inventory_count', item.inventory_count || 0);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Merchandise Management</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                Create or edit merchandise items to sell to your fans
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Product Images */}
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload product images
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="merch-images"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('merch-images')?.click()}
                    >
                      Select Images
                    </Button>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                    {MERCH_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your product..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select onValueChange={(value: any) => setValue('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    {...register('inventory_count', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.inventory_count && (
                    <p className="text-sm text-destructive mt-1">{errors.inventory_count.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={merchImageUpload.uploading}>
                  {selectedItem ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {merchItems.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No merchandise yet</h3>
              <p className="mb-4">Start selling your branded merchandise to fans</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Product
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.images && item.images.length > 0 && (
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={item.images[0]} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <Badge variant={item.is_active ? "default" : "secondary"}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {item.price} {item.currency}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Stock: {item.inventory_count || 0}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleMerchActiveStatus(item.id)}
                    >
                      {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteMerchItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};