import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, Music, Heart, Users, TrendingUp, Play, 
  Clock, Headphones, Plus, Settings, BarChart3 
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import AdvancedPlaylistManager from '@/components/AdvancedPlaylistManager';
import AnalyticsInsights from '@/components/AnalyticsInsights';
import { useAuth } from '@/hooks/useAuth';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useFavorites } from '@/hooks/useFavorites';
import { useSocial } from '@/hooks/useSocial';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, stats, loading } = useProfile();
  const { playlists } = usePlaylists();
  const { favorites } = useFavorites();
  const { following, followers } = useSocial();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your dashboard
            </p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-center text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.username || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Manage your music experience and track your activity
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{playlists.length}</p>
                    <p className="text-xs text-muted-foreground">Playlists</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{favorites.length}</p>
                    <p className="text-xs text-muted-foreground">Favorites</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{followers.length}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{following.length}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Playlists</CardTitle>
                </CardHeader>
                <CardContent>
                  {playlists.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">No playlists yet</p>
                      <Button size="sm" className="gradient-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Playlist
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {playlists.slice(0, 3).map((playlist) => (
                        <div key={playlist.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <Music className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{playlist.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {playlist.is_public ? 'Public' : 'Private'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/trending">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Discover Music
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/dashboard/profile">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdvancedPlaylistManager />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Playlist
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Discover Music
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    View Favorites
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  My Favorites ({favorites.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No favorites yet</p>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/trending">Discover Music</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.slice(0, 6).map((favorite, index) => (
                      <div key={index} className="p-3 rounded border hover:bg-accent">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center">
                            <Heart className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">Favorite Track</p>
                            <p className="text-sm text-muted-foreground">Favorited track</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Following ({following.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {following.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Not following anyone yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {following.slice(0, 5).map((follow, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Following User</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Followers ({followers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {followers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No followers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {followers.slice(0, 5).map((follower, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Follower User</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;