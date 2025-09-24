import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, MoreVertical, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePlayer } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

const MobileAudioPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration, 
    volume,
    togglePlay, 
    next, 
    previous, 
    seek, 
    setVolume 
  } = usePlayer();
  
  const { favorites, toggleFavorite } = useFavorites();
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  if (!currentTrack) return null;

  const isFavorite = favorites.includes(currentTrack.id);
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  return (
    <>
      {/* Mini Player Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center p-3 cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentTrack.cover && (
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.title}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-2"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </SheetTrigger>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Full Screen Player */}
          <SheetContent side="bottom" className="h-full p-0">
            <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Now Playing
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Album Art */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-80 h-80 max-w-[80vw] max-h-[40vh] rounded-2xl overflow-hidden shadow-2xl">
                  {currentTrack.cover ? (
                    <img 
                      src={currentTrack.cover} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-6xl text-muted-foreground/50">♪</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Track Info */}
              <div className="px-8 pb-4 text-center">
                <h2 className="text-2xl font-bold mb-2 truncate">{currentTrack.title}</h2>
                <p className="text-lg text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>

              {/* Progress */}
              <div className="px-8 pb-6">
                <Slider
                  value={[progress]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="px-8 pb-8">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={previous}
                    className="p-3"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-primary hover:bg-primary/90"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={next}
                    className="p-3"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(currentTrack.id)}
                    className={cn(
                      "p-2",
                      isFavorite && "text-red-500 hover:text-red-600"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVolumeControl(!showVolumeControl)}
                      className="p-2"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                    {showVolumeControl && (
                      <div className="w-20">
                        <Slider
                          value={[volume * 100]}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileAudioPlayer;