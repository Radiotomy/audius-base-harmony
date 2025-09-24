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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Music, Image, X, Check } from 'lucide-react';
import { useTrackUpload, useCoverArtUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const MUSIC_GENRES = [
  'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country',
  'Folk', 'Reggae', 'Blues', 'Punk', 'Metal', 'Alternative', 'Indie', 'Dance',
  'House', 'Techno', 'Dubstep', 'Ambient', 'Experimental', 'World Music'
];

const trackUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  genre: z.string().min(1, 'Genre is required'),
  license_type: z.enum(['all_rights_reserved', 'creative_commons', 'public_domain']),
  is_explicit: z.boolean().default(false),
  copyright_info: z.string().max(200, 'Copyright info must be less than 200 characters').optional(),
});

type TrackUploadFormData = z.infer<typeof trackUploadSchema>;

interface TrackUploadDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export const TrackUploadDialog = ({ children, onSuccess }: TrackUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState<'form' | 'uploading' | 'complete'>('form');

  const { toast } = useToast();
  
  const trackUpload = useTrackUpload({
    onProgress: (progress) => {
      console.log('Track upload progress:', progress.percentage);
    },
  });

  const coverArtUpload = useCoverArtUpload({
    onProgress: (progress) => {
      console.log('Cover art upload progress:', progress.percentage);
    },
  });

  const form = useForm<TrackUploadFormData>({
    resolver: zodResolver(trackUploadSchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      license_type: 'all_rights_reserved',
      is_explicit: false,
      copyright_info: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      
      // Create audio preview URL
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
      
      // Auto-populate title from filename if empty
      if (!watch('title')) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setValue('title', fileName);
      }
    }
  };

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
    setAudioFile(null);
    setCoverArtFile(null);
    setAudioPreview(null);
    setCoverPreview(null);
    setUploadStep('form');
  };

  const onSubmit = async (data: TrackUploadFormData) => {
    if (!audioFile) {
      toast({
        title: 'Audio File Required',
        description: 'Please select an audio file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploadStep('uploading');

    try {
      // Upload audio file
      const audioResult = await trackUpload.uploadFile(audioFile);
      if (!audioResult) {
        setUploadStep('form');
        return;
      }

      // Upload cover art if provided
      let coverArtUrl = '';
      if (coverArtFile) {
        const coverResult = await coverArtUpload.uploadFile(coverArtFile);
        if (coverResult) {
          coverArtUrl = coverResult.url;
        }
      }

      // Save track metadata to database
      const { useArtistUploads } = await import('@/hooks/useArtistUploads');
      const { createUpload } = useArtistUploads();
      
      const uploadResult = await createUpload({
        title: data.title,
        description: data.description,
        genre: data.genre,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        audio_file_url: audioResult.path,
        artwork_url: coverArtUrl,
        license_type: data.license_type,
        is_explicit: data.is_explicit,
        copyright_info: data.copyright_info,
        file_size: audioFile.size,
        file_format: audioFile.type,
      });

      if (!uploadResult) {
        setUploadStep('form');
        return;
      }

      setUploadStep('complete');
      
      toast({
        title: 'Track Uploaded Successfully',
        description: `${data.title} has been uploaded and is being processed`,
      });

      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false);
        resetForm();
        onSuccess?.();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStep('form');
    }
  };

  const handleClose = () => {
    if (uploadStep !== 'uploading') {
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
            <Upload className="h-5 w-5" />
            Upload Track
          </DialogTitle>
          <DialogDescription>
            Upload your music track with artwork and metadata
          </DialogDescription>
        </DialogHeader>

        {uploadStep === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Audio File Upload */}
            <div className="space-y-2">
              <Label htmlFor="audio-file">Audio File *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {audioFile ? audioFile.name : 'Click to upload audio file'}
                  </p>
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*,.mp3,.wav,.flac,.m4a,.aac"
                    onChange={handleAudioFileChange}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('audio-file')?.click()}
                  >
                    {audioFile ? 'Change File' : 'Select Audio File'}
                  </Button>
                </div>
                {audioPreview && (
                  <div className="mt-4">
                    <audio controls className="w-full">
                      <source src={audioPreview} />
                    </audio>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Art Upload */}
            <div className="space-y-2">
              <Label htmlFor="cover-art">Cover Art (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {coverArtFile ? coverArtFile.name : 'Click to upload cover art'}
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
                    {coverArtFile ? 'Change Image' : 'Select Cover Art'}
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

            {/* Track Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Track Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter track title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

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
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your track..."
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
                {['original', 'remix', 'instrumental', 'vocal', 'live', 'acoustic', 'electronic'].map((tag) => (
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

            {/* License and Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license">License Type</Label>
                <Select onValueChange={(value: any) => setValue('license_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_rights_reserved">All Rights Reserved</SelectItem>
                    <SelectItem value="creative_commons">Creative Commons</SelectItem>
                    <SelectItem value="public_domain">Public Domain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="explicit"
                  {...register('is_explicit')}
                />
                <Label htmlFor="explicit">Explicit Content</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="copyright">Copyright Information</Label>
              <Input
                id="copyright"
                {...register('copyright_info')}
                placeholder="© 2024 Artist Name"
              />
              {errors.copyright_info && (
                <p className="text-sm text-destructive mt-1">{errors.copyright_info.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={trackUpload.uploading || coverArtUpload.uploading}>
                Upload Track
              </Button>
            </div>
          </form>
        )}

        {uploadStep === 'uploading' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Uploading Track...</h3>
              <p className="text-muted-foreground">Please don't close this window</p>
            </div>

            {trackUpload.progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Audio File</span>
                  <span>{trackUpload.progress.percentage}%</span>
                </div>
                <Progress value={trackUpload.progress.percentage} />
              </div>
            )}

            {coverArtUpload.progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cover Art</span>
                  <span>{coverArtUpload.progress.percentage}%</span>
                </div>
                <Progress value={coverArtUpload.progress.percentage} />
              </div>
            )}
          </div>
        )}

        {uploadStep === 'complete' && (
          <div className="space-y-6 py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Complete!</h3>
            <p className="text-muted-foreground">
              Your track has been uploaded successfully and is being processed.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};