import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart, MoreHorizontal, Zap, MessageCircle, Star } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import AddToPlaylistDialog from './AddToPlaylistDialog';
import TipArtistDialog from './TipArtistDialog';
import RatingStars from './RatingStars';
import CommentSection from './CommentSection';
import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/contexts/PlayerContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
  const player = usePlayer();
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
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

  const handleDirectPlay = async () => {
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist: track.user?.name || 'Unknown Artist',
      duration: formatDuration(track.duration),
      cover: track.artwork?.['480x480'] || track.artwork?.['150x150'],
      audiusId: track.id,
    };
    
    await player.play(transformedTrack, [transformedTrack], true);
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
            onClick={() => onPlay ? onPlay(track) : handleDirectPlay()}
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

        {/* Rating */}
        <div className="mb-3">
          <RatingStars
            rating={0}
            onRate={(rating) => console.log('Rating:', rating)}
            size="sm"
            showCount={true}
            count={0}
          />
        </div>

        {/* Actions */}
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <FavoriteButton
                trackId={track.id}
                size="sm"
              />
              <Button
                onClick={() => setShowComments(!showComments)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowTipDialog(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-primary"
              >
                <Zap className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <AddToPlaylistDialog trackId={track.id}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Add to Playlist
                    </DropdownMenuItem>
                  </AddToPlaylistDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button
              onClick={() => onPlay ? onPlay(track) : handleDirectPlay()}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              <Play className="h-4 w-4 mr-1" />
              Play
            </Button>
          </div>
        )}

        {/* Comments Section */}
        {showComments && user && (
          <div className="mt-4 pt-4 border-t">
            <CommentSection
              targetId={track.id}
              targetType="track"
            />
          </div>
        )}

        {/* Tip Dialog */}
        <TipArtistDialog
          open={showTipDialog}
          onOpenChange={setShowTipDialog}
          artist={{
            id: track.user?.name || 'unknown',
            name: track.user?.name || 'Unknown Artist',
          }}
        />
      </CardContent>
    </Card>
  );
};

export default TrackCard;