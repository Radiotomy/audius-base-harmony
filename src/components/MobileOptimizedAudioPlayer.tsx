import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, MoreHorizontal, ChevronUp, Repeat, Shuffle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlayer, type RepeatMode } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import RealTimeVisualizer from './RealTimeVisualizer';

const MobileOptimizedAudioPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration,
    currentTime,
    volume,
    queue,
    currentIndex,
    repeatMode,
    isShuffled,
    togglePlay, 
    next, 
    previous, 
    seek, 
    setVolume,
    setRepeatMode,
    toggleShuffle,
    webAudio
  } = usePlayer();
  
  const { isFavorited, toggleFavorite } = useFavorites();
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  // Touch-optimized progress handling
  const handleProgressStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = progressRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setTempProgress(progress * duration);
    }
  }, [duration]);

  const handleProgressMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setTempProgress(progress * duration);
  }, [isDragging, duration]);

  const handleProgressEnd = useCallback(() => {
    if (isDragging) {
      seek(tempProgress);
      setIsDragging(false);
    }
  }, [isDragging, tempProgress, seek]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleProgressMove, { passive: true });
      document.addEventListener('mousemove', handleProgressMove);
      document.addEventListener('touchend', handleProgressEnd);
      document.addEventListener('mouseup', handleProgressEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleProgressMove);
        document.removeEventListener('mousemove', handleProgressMove);
        document.removeEventListener('touchend', handleProgressEnd);
        document.removeEventListener('mouseup', handleProgressEnd);
      };
    }
  }, [isDragging, handleProgressMove, handleProgressEnd]);

  if (!currentTrack) return null;

  const isFav = isFavorited(currentTrack.id);
  const displayProgress = isDragging ? tempProgress : currentTime;
  const progressPercentage = duration > 0 ? (displayProgress / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'track': return <Repeat className="h-5 w-5 text-primary" />;
      case 'playlist': return <Repeat className="h-5 w-5 text-primary" />;
      default: return <Repeat className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['none', 'track', 'playlist'];
    const currentIdx = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  return (
    <>
      {/* Mini Player Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center p-3 cursor-pointer hover:bg-accent/50 transition-colors touch-action-manipulation tap-highlight-none">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentTrack.cover && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={currentTrack.cover} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-2 touch-target audio-controls"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </SheetTrigger>

          {/* Progress bar */}
          <div 
            ref={progressRef}
            className="absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer touch-action-pan-y"
            onTouchStart={handleProgressStart}
            onMouseDown={handleProgressStart}
          >
            <div 
              className="h-full bg-primary transition-all duration-150 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Full Screen Player */}
          <SheetContent side="bottom" className="h-full p-0 safe-area-inset-bottom">
            <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Now Playing
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="p-2 touch-target">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Album Art & Visualizer */}
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="relative w-80 h-80 max-w-[80vw] max-h-[40vh] rounded-2xl overflow-hidden shadow-2xl mb-4">
                  {currentTrack.cover ? (
                    <img 
                      src={currentTrack.cover} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-6xl text-muted-foreground/50">♪</div>
                    </div>
                  )}
                  
                  {/* Visualizer overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                    <RealTimeVisualizer 
                      isPlaying={isPlaying}
                      analyser={webAudio.analyser}
                      analyserData={webAudio.analyserData}
                      type="bars"
                      className="w-full h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Track Info */}
              <div className="px-6 pb-4 text-center">
                <h2 className="text-2xl font-bold mb-2 truncate">{currentTrack.title}</h2>
                <p className="text-lg text-muted-foreground truncate">{currentTrack.artist}</p>
                {queue.length > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentIndex + 1} of {queue.length}
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="px-6 pb-6">
                <div 
                  ref={progressRef}
                  className="relative h-2 bg-muted rounded-full mb-2 cursor-pointer touch-action-pan-y"
                  onTouchStart={handleProgressStart}
                  onMouseDown={handleProgressStart}
                >
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-150 ease-out"
                    style={{ left: `calc(${progressPercentage}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(displayProgress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="px-6 pb-6">
                {/* Main Controls */}
                <div className="flex items-center justify-center gap-8 mb-6">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={previous}
                        disabled={currentIndex <= 0}
                        className="p-3 touch-target audio-controls"
                      >
                        <SkipBack className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Previous track</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        onClick={togglePlay}
                        className="p-4 rounded-full bg-primary hover:bg-primary/90 w-16 h-16 touch-target audio-controls shadow-glow"
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8" />
                        ) : (
                          <Play className="h-8 w-8 ml-1" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={next}
                        disabled={currentIndex >= queue.length - 1}
                        className="p-3 touch-target audio-controls"
                      >
                        <SkipForward className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Next track</TooltipContent>
                  </Tooltip>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleShuffle}
                          className={cn(
                            "p-2 touch-target audio-controls",
                            isShuffled ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          <Shuffle className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Shuffle {isShuffled ? 'on' : 'off'}</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cycleRepeatMode}
                          className="p-2 touch-target audio-controls"
                        >
                          {getRepeatIcon()}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Repeat: {repeatMode === 'none' ? 'off' : repeatMode === 'track' ? 'one' : 'all'}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(currentTrack.id)}
                          className={cn(
                            "p-2 touch-target audio-controls",
                            isFav && "text-red-500 hover:text-red-600"
                          )}
                        >
                          <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isFav ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVolumeControl(!showVolumeControl)}
                          className="p-2 touch-target audio-controls"
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Volume</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Volume Control */}
                {showVolumeControl && (
                  <div className="mt-4 px-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(values) => setVolume(values[0])}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {Math.round(volume)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileOptimizedAudioPlayer;