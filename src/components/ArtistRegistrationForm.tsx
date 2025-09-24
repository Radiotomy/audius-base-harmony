import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useArtistApplication, CreateApplicationData } from '@/hooks/useArtistApplication';
import { useAudiusClaim } from '@/hooks/useAudiusClaim';
import { Music, User, Link, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced input validation schema
const artistRegistrationSchema = z.object({
  display_name: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Display name contains invalid characters'),
  bio: z.string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters')
    .refine((val) => {
      // Basic XSS protection
      return !/<script|javascript:|on\w+=/i.test(val);
    }, 'Bio contains invalid characters'),
  application_type: z.enum(['native', 'audius_claim', 'hybrid']),
  audius_user_id: z.string().optional(),
  audius_handle: z.string().optional(),
});

// Social media URL validation
const validateSocialUrl = (url: string, platform: string): boolean => {
  if (!url) return true; // Optional field
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    const validDomains: { [key: string]: string[] } = {
      twitter: ['twitter.com', 'x.com'],
      instagram: ['instagram.com'],
      youtube: ['youtube.com', 'youtu.be'],
      soundcloud: ['soundcloud.com'],
    };
    
    return validDomains[platform]?.some(domain => hostname.includes(domain)) || false;
  } catch {
    return false;
  }
};

const MUSIC_GENRES = [
  'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country',
  'Folk', 'Reggae', 'Blues', 'Punk', 'Metal', 'Alternative', 'Indie', 'Dance',
  'House', 'Techno', 'Dubstep', 'Ambient', 'Experimental', 'World Music'
];

const VERIFICATION_METHODS = [
  { value: 'social_media', label: 'Social Media Verification' },
  { value: 'email_verification', label: 'Email Verification' },
  { value: 'track_upload', label: 'Track Upload Verification' }
] as const;

interface ArtistRegistrationFormProps {
  onSuccess?: () => void;
}

export const ArtistRegistrationForm = ({ onSuccess }: ArtistRegistrationFormProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [socialErrors, setSocialErrors] = useState<Record<string, string>>({});
  const [audiusSearchQuery, setAudiusSearchQuery] = useState('');
  const [audiusResults, setAudiusResults] = useState<any[]>([]);
  const [selectedAudiusArtist, setSelectedAudiusArtist] = useState<any>(null);
  
  const { createApplication, loading: applicationLoading } = useArtistApplication();
  const { searchAudiusArtist, createClaim, loading: claimLoading } = useAudiusClaim();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof artistRegistrationSchema>>({
    resolver: zodResolver(artistRegistrationSchema),
    defaultValues: {
      display_name: '',
      bio: '',
      application_type: 'native',
      audius_user_id: '',
      audius_handle: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const applicationType = watch('application_type');

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    // Validate URL if provided
    if (url && !validateSocialUrl(url, platform)) {
      setSocialErrors(prev => ({
        ...prev,
        [platform]: `Invalid ${platform} URL`
      }));
    } else {
      setSocialErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[platform];
        return newErrors;
      });
    }

    setSocialLinks(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  const handleAudiusSearch = async () => {
    if (!audiusSearchQuery.trim()) return;
    
    const results = await searchAudiusArtist(audiusSearchQuery);
    setAudiusResults(results);
  };

  const selectAudiusArtist = (artist: any) => {
    setSelectedAudiusArtist(artist);
    setValue('audius_user_id', artist.id);
    setValue('audius_handle', artist.handle);
    setValue('display_name', artist.name);
  };

  const onSubmit = async (data: z.infer<typeof artistRegistrationSchema>) => {
    // Validate genres selection
    if (selectedGenres.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one genre",
        variant: "destructive",
      });
      return;
    }

    // Check for social media validation errors
    const hasErrors = Object.keys(socialErrors).length > 0;
    if (hasErrors) {
      toast({
        title: "Validation Error", 
        description: "Please fix social media URL errors",
        variant: "destructive",
      });
      return;
    }

    try {
      const applicationData = {
        ...data,
        genres: selectedGenres,
        social_links: socialLinks,
      } as CreateApplicationData;

      await createApplication(applicationData);

      // If claiming Audius artist, also create the claim
      if (data.application_type === 'audius_claim' && selectedAudiusArtist) {
        await createClaim({
          audius_user_id: selectedAudiusArtist.id,
          audius_handle: selectedAudiusArtist.handle,
          verification_method: 'social_media', // Default method
          verification_data: {},
        });
      }

      onSuccess?.();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const loading = applicationLoading || claimLoading;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-6 w-6" />
          Artist Registration
        </CardTitle>
        <CardDescription>
          Join AudioBASE as an artist and start sharing your music with the world
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={applicationType} onValueChange={(value) => setValue('application_type', value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="native">AudioBASE Native</TabsTrigger>
              <TabsTrigger value="audius_claim">Claim Audius Profile</TabsTrigger>
              <TabsTrigger value="hybrid">Hybrid (Both)</TabsTrigger>
            </TabsList>

            <TabsContent value="native" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Upload Music Directly to AudioBASE</h3>
              </div>
              <p className="text-muted-foreground">
                Create your artist profile and upload music directly to AudioBASE platform.
              </p>
            </TabsContent>

            <TabsContent value="audius_claim" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Link className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Connect Your Audius Profile</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="audius-search">Search for your Audius profile</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="audius-search"
                      placeholder="Enter artist name or handle"
                      value={audiusSearchQuery}
                      onChange={(e) => setAudiusSearchQuery(e.target.value)}
                    />
                    <Button type="button" onClick={handleAudiusSearch} variant="outline">
                      Search
                    </Button>
                  </div>
                </div>

                {audiusResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select your Audius profile:</Label>
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {audiusResults.map((artist) => (
                        <div
                          key={artist.id}
                          className={`p-3 border rounded cursor-pointer hover:bg-accent ${
                            selectedAudiusArtist?.id === artist.id ? 'bg-accent border-primary' : ''
                          }`}
                          onClick={() => selectAudiusArtist(artist)}
                        >
                          <div className="flex items-center gap-3">
                            {artist.profile_picture && (
                              <img
                                src={artist.profile_picture}
                                alt={artist.name}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-medium">{artist.name}</div>
                              <div className="text-sm text-muted-foreground">@{artist.handle}</div>
                              <div className="text-xs text-muted-foreground">
                                {artist.follower_count} followers • {artist.track_count} tracks
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="hybrid" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Best of Both Worlds</h3>
              </div>
              <p className="text-muted-foreground">
                Connect your existing Audius profile and also upload new music directly to AudioBASE.
              </p>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Artist Display Name</Label>
              <Input
                id="display_name"
                {...register('display_name')}
                placeholder="Your artist name"
              />
              {errors.display_name && (
                <p className="text-sm text-destructive mt-1">{errors.display_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Genres (select all that apply)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {MUSIC_GENRES.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
            {selectedGenres.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">Please select at least one genre</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Artist Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about your music and artistic journey..."
              rows={4}
            />
            {errors.bio && (
              <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <Label>Social Media Links (optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {['twitter', 'instagram', 'youtube', 'soundcloud'].map((platform) => (
                <div key={platform}>
                  <Label htmlFor={platform} className="capitalize">{platform}</Label>
                  <Input
                    id={platform}
                    placeholder={`Your ${platform} URL`}
                    value={socialLinks[platform] || ''}
                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  />
                  {socialErrors[platform] && (
                    <p className="text-sm text-destructive mt-1">{socialErrors[platform]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || selectedGenres.length === 0}
          >
            {loading ? 'Submitting...' : 'Submit Artist Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};