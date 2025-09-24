import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Camera, Save, User, Link as LinkIcon, Music } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

const DashboardProfile: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, updating, updateProfile, uploadAvatar } = useProfile();
  
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    audius_handle: profile?.audius_handle || '',
  });

  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showListeningHistory: true,
    showFollowers: true,
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        audius_handle: profile.audius_handle || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Avatar must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    await uploadAvatar(file);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to manage your profile
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your public profile and privacy settings</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Photo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
          
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <label htmlFor="avatar-upload">
                <Button variant="outline" size="sm" className="cursor-pointer" disabled={updating}>
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>
          </div>
        </Card>

        {/* Profile Information */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div>
              <Label htmlFor="audius_handle">Audius Handle</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                  <Music className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="audius_handle"
                  value={formData.audius_handle}
                  onChange={(e) => handleInputChange('audius_handle', e.target.value)}
                  placeholder="your-audius-handle"
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Connect your Audius profile for enhanced features
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={updating}>
                {updating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Public Profile</h4>
                <p className="text-sm text-muted-foreground">
                  Allow others to see your profile and activity
                </p>
              </div>
              <Switch
                checked={privacySettings.profilePublic}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({ ...prev, profilePublic: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Show Listening History</h4>
                <p className="text-sm text-muted-foreground">
                  Display your recently played tracks on your profile
                </p>
              </div>
              <Switch
                checked={privacySettings.showListeningHistory}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({ ...prev, showListeningHistory: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Show Followers</h4>
                <p className="text-sm text-muted-foreground">
                  Allow others to see who follows you and who you follow
                </p>
              </div>
              <Switch
                checked={privacySettings.showFollowers}
                onCheckedChange={(checked) => 
                  setPrivacySettings(prev => ({ ...prev, showFollowers: checked }))
                }
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Profile URL</h4>
                <p className="text-sm text-muted-foreground">
                  Your profile can be accessed at:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    /profile/{user.id}
                  </code>
                  <Button size="sm" variant="ghost" className="h-auto p-1">
                    <LinkIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardProfile;