import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share } from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover?: string;
}

interface AudioPlayerProps {
  track?: Track;
  isCompact?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  track = {
    id: '1',
    title: 'Digital Dreams',
    artist: 'CryptoBeats',
    duration: '3:42'
  },
  isCompact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([30]);
  const [volume, setVolume] = useState([80]);
  const [isLiked, setIsLiked] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);

  if (isCompact) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 p-4 shadow-card bg-card/95 backdrop-blur-md border-border">
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            size="sm"
            className="h-10 w-10 rounded-full gradient-primary shadow-glow hover:scale-105 transition-bounce"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">{track.title}</span>
              <span className="text-xs text-muted-foreground">by {track.artist}</span>
            </div>
            <WaveformVisualizer isPlaying={isPlaying} className="h-6" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsLiked(!isLiked)}
              variant="ghost"
              size="sm"
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card bg-card/95 backdrop-blur-md border-border">
      <div className="space-y-4">
        {/* Track Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold">{track.title}</h3>
          <p className="text-muted-foreground">by {track.artist}</p>
        </div>

        {/* Waveform */}
        <div className="flex justify-center">
          <WaveformVisualizer isPlaying={isPlaying} />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Slider
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1:23</span>
            <span>{track.duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4">
          <Button variant="ghost" size="sm">
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={togglePlay}
            size="lg"
            className="h-14 w-14 rounded-full gradient-primary shadow-glow hover:scale-105 transition-bounce"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </Button>
          
          <Button variant="ghost" size="sm">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-32">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsLiked(!isLiked)}
              variant="ghost"
              size="sm"
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioPlayer;