import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Album, Plus, X, Image } from 'lucide-react';
import { format } from 'date-fns';
import { useAlbums, CreateAlbumData } from '@/hooks/useAlbums';
import { useCoverArtUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const MUSIC_GENRES = [
  'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country',
  'Folk', 'Reggae', 'Blues', 'Punk', 'Metal', 'Alternative', 'Indie', 'Dance',
  'House', 'Techno', 'Dubstep', 'Ambient', 'Experimental', 'World Music'
];

const albumCreationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  genre: z.string().min(1, 'Genre is required'),
  album_type: z.enum(['album', 'ep', 'single']),
  release_date: z.date().optional(),
});

type AlbumCreationFormData = z.infer<typeof albumCreationSchema>;

interface AlbumCreationDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export const AlbumCreationDialog = ({ children, onSuccess }: AlbumCreationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { toast } = useToast();
  const { createAlbum } = useAlbums();
  
  const coverArtUpload = useCoverArtUpload({
    onProgress: (progress) => {
      console.log('Cover art upload progress:', progress.percentage);
    },
  });

  const form = useForm<AlbumCreationFormData>({
    resolver: zodResolver(albumCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      album_type: 'album',
      release_date: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

  const handleCoverArtChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverArtFile(file);
      
      // Create image preview URL
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const resetForm = () => {
    reset();
    setSelectedTags([]);
    setCoverArtFile(null);
    setCoverPreview(null);
    setCreating(false);
  };

  const onSubmit = async (data: AlbumCreationFormData) => {
    setCreating(true);

    try {
      // Upload cover art if provided
      let coverArtUrl = '';
      if (coverArtFile) {
        const coverResult = await coverArtUpload.uploadFile(coverArtFile);
        if (coverResult) {
          coverArtUrl = coverResult.url;
        }
      }

      // Create album
      const albumData: CreateAlbumData = {
        title: data.title,
        description: data.description,
        genre: data.genre,
        album_type: data.album_type,
        release_date: data.release_date ? format(data.release_date, 'yyyy-MM-dd') : undefined,
        cover_art_url: coverArtUrl,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      const result = await createAlbum(albumData);

      if (result) {
        setOpen(false);
        resetForm();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Album creation error:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create album. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setOpen(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Album className="h-5 w-5" />
            Create Album
          </DialogTitle>
          <DialogDescription>
            Create a new album or EP to organize your tracks
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Art Upload */}
          <div className="space-y-2">
            <Label htmlFor="cover-art">Album Cover (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {coverArtFile ? coverArtFile.name : 'Click to upload album cover'}
                </p>
                <Input
                  id="cover-art"
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp"
                  onChange={handleCoverArtChange}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('cover-art')?.click()}
                >
                  {coverArtFile ? 'Change Cover' : 'Select Cover Art'}
                </Button>
              </div>
              {coverPreview && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={coverPreview} 
                    alt="Cover preview" 
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Album Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Album Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter album title"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="album_type">Album Type</Label>
              <Select onValueChange={(value: any) => setValue('album_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="album">Album</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Genre *</Label>
              <Select onValueChange={(value) => setValue('genre', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genre && (
                <p className="text-sm text-destructive mt-1">{errors.genre.message}</p>
              )}
            </div>

            <div>
              <Label>Release Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full pl-3 text-left font-normal"
                  >
                    {watch('release_date') ? (
                      format(watch('release_date')!, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watch('release_date')}
                    onSelect={(date) => setValue('release_date', date)}
                    disabled={(date) =>
                      date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your album..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (Select all that apply)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['concept album', 'instrumental', 'live', 'acoustic', 'experimental', 'collaboration', 'self-produced'].map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || coverArtUpload.uploading}>
              {creating ? 'Creating...' : 'Create Album'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};