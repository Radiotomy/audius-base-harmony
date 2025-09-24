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
import { ArtistEarningsWidget } from '@/components/ArtistEarningsWidget';
import LoadingSpinner from '@/components/LoadingSpinner';

const ArtistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (roleLoading || profileLoading) {
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
                      <p className="text-2xl font-bold">12</p>
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
                      <p className="text-2xl font-bold">3</p>
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
                      <p className="text-2xl font-bold">1.2k</p>
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
                      <p className="text-2xl font-bold">15.3k</p>
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
                  <Button className="w-full justify-start" size="lg">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Track
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Album className="h-4 w-4 mr-2" />
                    Create Album
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Image className="h-4 w-4 mr-2" />
                    Upload Cover Art
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add Merchandise
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Upload className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Track uploaded successfully</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">25 new followers</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Received tip: 0.05 ETH</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Widget */}
            <ArtistEarningsWidget />
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Music</h2>
              <div className="flex gap-2">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Track
                </Button>
                <Button variant="outline">
                  <Album className="h-4 w-4 mr-2" />
                  Create Album
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No tracks uploaded yet</p>
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Track
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Albums & EPs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Album className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No albums created yet</p>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Album
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Merchandise</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No merchandise yet</h3>
                  <p className="mb-4">Start selling your branded merchandise to fans</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Product
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analytics & Insights</h2>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Detailed Analytics
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Listening Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No listening data yet</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fan Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No engagement data yet</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistDashboard;