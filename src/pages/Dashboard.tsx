import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Music, Heart, Zap, TrendingUp, Clock, 
  Users, BarChart3, Settings, Play, Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useFavorites } from '@/hooks/useFavorites';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Breadcrumb from '@/components/Breadcrumb';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, stats, loading } = useProfile();
  const { playlists } = usePlaylists();
  const { favorites } = useFavorites();
  const location = useLocation();

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

  // Check if we're on a sub-route
  const isDashboardRoot = location.pathname === '/dashboard';

  if (!isDashboardRoot) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb />
        </div>
        <Outlet />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.username || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Manage your music experience and track your activity
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalPlaylists || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.totalFavorites || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.totalFollowers || 0}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats?.totalTips || 0}</p>
                <p className="text-xs text-muted-foreground">Tips Sent</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-auto p-4 justify-start">
            <Link to="/dashboard/profile" className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Edit Profile</p>
                <p className="text-xs opacity-70">Update your info</p>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link to="/dashboard/playlists" className="flex items-center gap-3">
              <Music className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">My Playlists</p>
                <p className="text-xs opacity-70">{playlists.length} playlists</p>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link to="/dashboard/favorites" className="flex items-center gap-3">
              <Heart className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Favorites</p>
                <p className="text-xs opacity-70">{favorites.length} tracks</p>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link to="/dashboard/analytics" className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Analytics</p>
                <p className="text-xs opacity-70">View stats</p>
              </div>
            </Link>
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Playlists */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Playlists</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/playlists">View All</Link>
              </Button>
            </div>
            
            {playlists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No playlists yet</p>
                <Button asChild size="sm">
                  <Link to="/dashboard/playlists">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Playlist
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {playlists.slice(0, 3).map((playlist) => (
                  <div key={playlist.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {playlist.is_public ? 'Public' : 'Private'} • Updated {new Date(playlist.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {playlist.is_public && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Listening Stats */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Listening Stats</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/analytics">View More</Link>
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Listening Time</span>
                </div>
                <span className="font-medium">
                  {stats?.totalListeningTime || 0} minutes
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Following</span>
                </div>
                <span className="font-medium">{stats?.totalFollowing || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Followers</span>
                </div>
                <span className="font-medium">{stats?.totalFollowers || 0}</span>
              </div>
            </div>

            {stats?.totalListeningTime === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start listening to see your stats!</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;