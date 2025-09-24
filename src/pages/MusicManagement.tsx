import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Music, 
  Album, 
  Upload,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { TrackManager } from '@/components/TrackManager';
import { AlbumManager } from '@/components/AlbumManager';
import { TrackUploadDialog } from '@/components/TrackUploadDialog';
import { AlbumCreationDialog } from '@/components/AlbumCreationDialog';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, Link } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';

export const MusicManagement: React.FC = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (role !== 'artist' && role !== 'admin') {
    return <Navigate to="/artist-registration" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/artist-dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Music Management</h1>
            <p className="text-muted-foreground">
              Manage your tracks, albums, and music catalog
            </p>
          </div>
        </div>

        <Tabs defaultValue="tracks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracks" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Track Management
            </TabsTrigger>
            <TabsTrigger value="albums" className="flex items-center gap-2">
              <Album className="h-4 w-4" />
              Album Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <TrackManager onTrackSelect={setSelectedTrack} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="albums" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <AlbumManager onAlbumSelect={setSelectedAlbum} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          <TrackUploadDialog>
            <Button size="lg" className="rounded-full shadow-lg">
              <Upload className="h-5 w-5 mr-2" />
              Upload Track
            </Button>
          </TrackUploadDialog>
          
          <AlbumCreationDialog>
            <Button variant="outline" size="lg" className="rounded-full shadow-lg bg-background">
              <Album className="h-5 w-5 mr-2" />
              Create Album
            </Button>
          </AlbumCreationDialog>
        </div>
      </div>
    </div>
  );
};