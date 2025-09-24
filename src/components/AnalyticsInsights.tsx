import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Play, Heart, 
  Clock, Headphones, BarChart3, Users 
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsInsightsProps {
  className?: string;
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ className }) => {
  const { user } = useAuth();
  const { profile, stats, loading } = useProfile();

  // Mock listening stats for now
  const listeningStats = [
    { track_id: 'track1', play_count: 15, total_listen_time: 900 },
    { track_id: 'track2', play_count: 12, total_listen_time: 720 },
    { track_id: 'track3', play_count: 8, total_listen_time: 480 },
  ];

  if (!user || loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading insights...</p>
        </CardContent>
      </Card>
    );
  }

  const totalListenTime = listeningStats.reduce((acc, stat) => acc + stat.total_listen_time, 0);
  const totalPlays = listeningStats.reduce((acc, stat) => acc + stat.play_count, 0);
  const topGenres = ['Electronic', 'Hip-Hop', 'Pop', 'Rock', 'Jazz']; // Mock data
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const insights = [
    {
      title: 'Total Listen Time',
      value: formatTime(totalListenTime),
      icon: Clock,
      trend: '+12%',
      trendUp: true,
      description: 'This week',
    },
    {
      title: 'Tracks Played',
      value: totalPlays.toString(),
      icon: Play,
      trend: '+8%',
      trendUp: true,
      description: 'This week',
    },
    {
      title: 'Favorites Added',
      value: '24',
      icon: Heart,
      trend: '+15%',
      trendUp: true,
      description: 'This week',
    },
    {
      title: 'Artists Followed',
      value: '8',
      icon: Users,
      trend: '+3%',
      trendUp: true,
      description: 'This week',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{insight.title}</p>
                  <p className="text-2xl font-bold">{insight.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <insight.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={insight.trendUp ? "default" : "secondary"} className="text-xs">
                  {insight.trendUp ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {insight.trend}
                </Badge>
                <span className="text-xs text-muted-foreground">{insight.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listening Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Genres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topGenres.map((genre, index) => {
              const percentage = Math.max(20, 100 - index * 15);
              return (
                <div key={genre} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{genre}</span>
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Most Played Tracks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listeningStats.slice(0, 5).map((stat, index) => (
              <div key={stat.track_id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Track {stat.track_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.play_count} plays • {formatTime(stat.total_listen_time)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stat.play_count}
                </Badge>
              </div>
            ))}
            {listeningStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No listening data yet. Start playing some tracks!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listening Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Music Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Peak Hours</h3>
              <p className="text-sm text-muted-foreground">
                You listen most between 7-9 PM
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Discovery Rate</h3>
              <p className="text-sm text-muted-foreground">
                45% of your plays are new tracks
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mx-auto mb-3 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Engagement</h3>
              <p className="text-sm text-muted-foreground">
                High engagement with favorites
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsInsights;