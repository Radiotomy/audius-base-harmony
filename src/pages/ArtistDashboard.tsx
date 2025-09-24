import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, Music, Image, ShoppingBag, DollarSign, 
  TrendingUp, Users, Play, Settings, Plus,
  Album, Headphones, Star, Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import { Link, Navigate } from 'react-router-dom';
import { TrackUploadDialog } from '@/components/TrackUploadDialog';
import { AlbumCreationDialog } from '@/components/AlbumCreationDialog';
import { MerchandiseManager } from '@/components/MerchandiseManager';
import { ArtistEarningsWidget } from '@/components/ArtistEarningsWidget';
import { ActivityFeed } from '@/components/ActivityFeed';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { TrackManager } from '@/components/TrackManager';
import { AlbumManager } from '@/components/AlbumManager';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useArtistUploads } from '@/hooks/useArtistUploads';
import { useAlbums } from '@/hooks/useAlbums';

const ArtistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const { stats, recentActivity, loading: statsLoading, addActivity } = useDashboardStats();
  const { uploads, getUploadStats } = useArtistUploads();
  const { albums } = useAlbums();

  const uploadStats = getUploadStats();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (roleLoading || profileLoading || statsLoading) {
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
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Artist Studio
              </h1>
              <p className="text-muted-foreground">
                Manage your music, engage with fans, and track your success
              </p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Star className="h-4 w-4 mr-1" />
              Verified Artist
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="music">My Music</TabsTrigger>
            <TabsTrigger value="media">Media Library</TabsTrigger>
            <TabsTrigger value="merch">Merchandise</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.trackCount}</p>
                      <p className="text-xs text-muted-foreground">Tracks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Album className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.albumCount}</p>
                      <p className="text-xs text-muted-foreground">Albums</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.followerCount}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Play className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalPlays.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Plays</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <TrackUploadDialog 
                    onSuccess={() => {
                      addActivity('upload', 'New track uploaded', 'Successfully uploaded a new track');
                    }}
                  >
                    <Button className="w-full justify-start" size="lg">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Track
                    </Button>
                  </TrackUploadDialog>
                  <AlbumCreationDialog
                    onSuccess={() => {
                      addActivity('album_create', 'New album created', 'Successfully created a new album');
                    }}
                  >
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Album className="h-4 w-4 mr-2" />
                      Create Album
                    </Button>
                  </AlbumCreationDialog>
                  <Link to="/music-management">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Music className="h-4 w-4 mr-2" />
                      Manage Music
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add Merchandise
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity with Enhanced Feed */}
              <ActivityFeed 
                activities={recentActivity} 
                loading={statsLoading}
                onViewAll={() => {
                  // Could implement a full activity page
                  console.log('View all activities');
                }}
              />
            </div>

            {/* Earnings Widget */}
            <ArtistEarningsWidget />
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            <TrackManager onTrackSelect={(track) => console.log('Edit track:', track)} />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Media Library</h2>
              <Button>
                <Image className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No profile images</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cover Art</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Album className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No cover art</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Merchandise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No merch images</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="merch" className="space-y-6">
            <MerchandiseManager />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Earnings & Revenue</h2>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </div>

            <ArtistEarningsWidget />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tips</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">NFT Sales</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Merchandise</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Royalties</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistDashboard;