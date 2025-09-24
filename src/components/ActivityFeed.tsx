import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  DollarSign, 
  Users, 
  Play, 
  Album,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { RecentActivity } from '@/hooks/useDashboardStats';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: RecentActivity[];
  loading?: boolean;
  showAll?: boolean;
  onViewAll?: () => void;
}

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'upload':
      return <Upload className="h-4 w-4" />;
    case 'tip':
      return <DollarSign className="h-4 w-4" />;
    case 'follow':
      return <Users className="h-4 w-4" />;
    case 'play':
      return <Play className="h-4 w-4" />;
    case 'album_create':
      return <Album className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'upload':
      return 'text-green-600 bg-green-100';
    case 'tip':
      return 'text-purple-600 bg-purple-100';
    case 'follow':
      return 'text-blue-600 bg-blue-100';
    case 'play':
      return 'text-orange-600 bg-orange-100';
    case 'album_create':
      return 'text-indigo-600 bg-indigo-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getActivityBadge = (type: RecentActivity['type']) => {
  switch (type) {
    case 'upload':
      return { variant: 'default' as const, label: 'Upload' };
    case 'tip':
      return { variant: 'secondary' as const, label: 'Tip' };
    case 'follow':
      return { variant: 'outline' as const, label: 'Follow' };
    case 'play':
      return { variant: 'destructive' as const, label: 'Play' };
    case 'album_create':
      return { variant: 'default' as const, label: 'Album' };
    default:
      return { variant: 'secondary' as const, label: 'Activity' };
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  showAll = false,
  onViewAll,
}) => {
  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          {!showAll && activities.length > 5 && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Your activity will appear here</p>
          </div>
        ) : (
          <ScrollArea className={showAll ? "h-96" : undefined}>
            <div className="space-y-4">
              {displayedActivities.map((activity) => {
                const iconColor = getActivityColor(activity.type);
                const badge = getActivityBadge(activity.type);
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={badge.variant} className="text-xs">
                              {badge.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        {activity.metadata?.amount && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                              +{activity.metadata.amount} {activity.metadata.currency || 'ETH'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};