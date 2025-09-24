import React, { useState, useRef } from 'react';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  cover?: string;
  audiusId?: string;
}

interface SwipeableTrackCardProps {
  track: Track;
  onSwipeLeft?: (track: Track) => void;
  onSwipeRight?: (track: Track) => void;
  className?: string;
}

const SwipeableTrackCard: React.FC<SwipeableTrackCardProps> = ({
  track,
  onSwipeLeft,
  onSwipeRight,
  className
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { currentTrack, isPlaying, play, togglePlay } = usePlayer();
  const { favorites, toggleFavorite } = useFavorites();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isFavorite = favorites.includes(track.id);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    const threshold = 80;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && onSwipeRight) {
        onSwipeRight(track);
      } else if (dragOffset < 0 && onSwipeLeft) {
        onSwipeLeft(track);
      }
    }
    
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    const threshold = 80;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && onSwipeRight) {
        onSwipeRight(track);
      } else if (dragOffset < 0 && onSwipeLeft) {
        onSwipeLeft(track);
      }
    }
    
    setDragOffset(0);
    setIsDragging(false);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      // Transform track to match PlayerContext requirements
      const playerTrack = {
        ...track,
        duration: track.duration || '0:00'
      };
      play(playerTrack);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id);
  };

  const formatDuration = (duration?: string) => {
    return duration || '';
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative bg-card rounded-lg border border-border overflow-hidden touch-pan-y select-none",
        "transition-transform duration-200 ease-out",
        isDragging && "transition-none",
        className
      )}
      style={{
        transform: `translateX(${dragOffset}px)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        {/* Right swipe action (Favorite) */}
        <div 
          className={cn(
            "flex items-center justify-center bg-green-500/20 text-green-500 transition-opacity",
            dragOffset > 40 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.max(0, dragOffset) }}
        >
          <Heart className="h-6 w-6" />
        </div>
        
        {/* Left swipe action (More options) */}
        <div 
          className={cn(
            "flex items-center justify-center bg-blue-500/20 text-blue-500 transition-opacity ml-auto",
            dragOffset < -40 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.max(0, -dragOffset) }}
        >
          <MoreVertical className="h-6 w-6" />
        </div>
      </div>

      {/* Card Content */}
      <div className="relative bg-card p-4 flex items-center gap-3">
        {/* Album Art */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
            {track.cover ? (
              <img 
                src={track.cover} 
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-lg">♪</span>
              </div>
            )}
          </div>
          
          {/* Play/Pause Overlay */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlay}
            className={cn(
              "absolute inset-0 w-full h-full rounded-lg bg-black/50 opacity-0 hover:opacity-100 transition-opacity",
              "flex items-center justify-center text-white",
              isCurrentTrack && "opacity-100 bg-primary/80"
            )}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate mb-1">{track.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>

        {/* Duration & Actions */}
        <div className="flex items-center gap-2">
          {track.duration && (
            <span className="text-xs text-muted-foreground">
              {formatDuration(track.duration)}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className={cn(
              "p-1.5 touch-manipulation",
              isFavorite && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Currently Playing Indicator */}
      {isCurrentTrack && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default SwipeableTrackCard;