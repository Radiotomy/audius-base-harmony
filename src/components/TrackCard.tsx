import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import AddToPlaylistDialog from './AddToPlaylistDialog';
import { useAuth } from '@/hooks/useAuth';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    user?: { name: string };
    artwork?: { '150x150'?: string; '480x480'?: string };
    play_count?: number;
    duration?: number;
  };
  onPlay?: (track: any) => void;
  className?: string;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay, className }) => {
  const { user } = useAuth();
  
  const formatPlayCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="relative">
        {track.artwork?.['480x480'] && (
          <img
            src={track.artwork['480x480']}
            alt={track.title}
            className="w-full h-48 object-cover"
          />
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onPlay?.(track)}
            size="lg"
            className="h-14 w-14 rounded-full gradient-primary shadow-glow hover:scale-110 transition-transform"
          >
            <Play className="h-6 w-6 ml-0.5" />
          </Button>
        </div>

        {/* Stats Badge */}
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {formatPlayCount(track.play_count)} plays
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{track.title}</h3>
            <p className="text-muted-foreground text-sm truncate">
              by {track.user?.name || 'Unknown Artist'}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-muted-foreground">
              {formatDuration(track.duration)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FavoriteButton
                trackId={track.id}
                size="sm"
              />
              <AddToPlaylistDialog trackId={track.id}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </AddToPlaylistDialog>
            </div>
            
            <Button
              onClick={() => onPlay?.(track)}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              <Play className="h-4 w-4 mr-1" />
              Play
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackCard;