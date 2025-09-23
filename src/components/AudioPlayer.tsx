import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
// Force refresh by updating import
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share, List, MoreHorizontal } from 'lucide-react';
import { useAudioPlayer, type Track } from '@/hooks/useAudioPlayer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFavorites } from '@/hooks/useFavorites';
import WaveformVisualizer from './WaveformVisualizer';

interface AudioPlayerProps {
  initialTrack?: Track;
  initialQueue?: Track[];
  isCompact?: boolean;
  showQueue?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  initialTrack,
  initialQueue = [],
  isCompact = false,
  showQueue = false
}) => {
  // Fixed: Using List instead of Queue icon
  const [expanded, setExpanded] = React.useState(false);
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    duration,
    currentTime,
    queue,
    currentIndex,
    isLoading,
    playTrack,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    addToQueue,
    removeFromQueue,
  } = useAudioPlayer();

  const { isFavorited, toggleFavorite } = useFavorites();
  const isFav = currentTrack ? isFavorited(currentTrack.id) : false;

  // Initialize with track if provided, or switch tracks when initialTrack changes
  React.useEffect(() => {
    if (initialTrack) {
      // Always play the new track when initialTrack changes
      playTrack(initialTrack, initialQueue);
    }
  }, [initialTrack, initialQueue, playTrack]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: togglePlay,
    onNext: next,
    onPrevious: previous,
    onVolumeUp: () => setVolume(Math.min(100, volume + 10)),
    onVolumeDown: () => setVolume(Math.max(0, volume - 10)),
    onSeekForward: () => seek(Math.min(100, progress + 5)),
    onSeekBackward: () => seek(Math.max(0, progress - 5)),
    enabled: !!currentTrack,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (values: number[]) => {
    seek(values[0]);
  };

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  if (!currentTrack) {
    return null;
  }

  if (isCompact && !expanded) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 p-4 shadow-card bg-card/95 backdrop-blur-md border-border z-50">
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            size="sm"
            disabled={isLoading}
            className="h-10 w-10 rounded-full gradient-primary shadow-glow hover:scale-105 transition-bounce"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">{currentTrack.title}</span>
              <span className="text-xs text-muted-foreground">by {currentTrack.artist}</span>
            </div>
            <div className="relative">
              <WaveformVisualizer isPlaying={isPlaying} className="h-6" />
              <div className="absolute inset-0 flex items-center">
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={0.1}
                  className="w-full opacity-0 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              onClick={previous}
              variant="ghost"
              size="sm"
              disabled={currentIndex <= 0}
              className="h-8 w-8 p-0"
            >
              <SkipBack className="h-3 w-3" />
            </Button>
            <Button
              onClick={next}
              variant="ghost"
              size="sm"
              disabled={currentIndex >= queue.length - 1}
              className="h-8 w-8 p-0"
            >
              <SkipForward className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${isFav ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-3 w-3 ${isFav ? 'fill-current' : ''}`} />
            </Button>
            <div className="flex items-center gap-1 ml-2">
              <Volume2 className="h-3 w-3 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-16"
              />
            </div>
            {queue.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(true)} aria-label="Open advanced player">
                <List className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card bg-card/95 backdrop-blur-md border-border">
      <div className="space-y-6">
        {/* Track Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold">{currentTrack.title}</h3>
          <p className="text-muted-foreground">by {currentTrack.artist}</p>
          <div className="w-32 h-32 mx-auto mt-4 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
            {currentTrack.cover ? (
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-4xl">🎵</div>';
                }}
              />
            ) : (
              <div className="text-4xl">🎵</div>
            )}
          </div>
        </div>

        {/* Waveform */}
        <div className="flex justify-center">
          <WaveformVisualizer isPlaying={isPlaying} />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-6">
          <Button 
            onClick={previous}
            variant="ghost" 
            size="sm"
            disabled={currentIndex <= 0}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={togglePlay}
            size="lg"
            disabled={isLoading}
            className="h-16 w-16 rounded-full gradient-primary shadow-glow hover:scale-105 transition-bounce"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
          
          <Button 
            onClick={next}
            variant="ghost" 
            size="sm"
            disabled={currentIndex >= queue.length - 1}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-40">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {Math.round(volume)}%
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
              variant="ghost"
              size="sm"
              className={isFav ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
            {queue.length > 1 && (
              <Button variant="ghost" size="sm">
                <List className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Queue Preview */}
        {showQueue && queue.length > 1 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Up Next ({queue.length - currentIndex - 1})</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {queue.slice(currentIndex + 1, currentIndex + 4).map((track, index) => (
                <div key={track.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-accent">
                  <span className="text-muted-foreground w-4">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{track.title}</p>
                    <p className="text-muted-foreground truncate text-xs">{track.artist}</p>
                  </div>
                  <Button
                    onClick={() => removeFromQueue(track.id)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {queue.length - currentIndex - 1 > 3 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{queue.length - currentIndex - 4} more tracks
                </p>
              )}
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Info */}
        <div className="text-xs text-muted-foreground text-center">
          Press Space to play/pause • ← → for prev/next • ↑ ↓ for volume • J/L to seek
        </div>
      </div>
    </Card>
  );
};

export default AudioPlayer;