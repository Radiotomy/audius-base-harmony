import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudiusStreamUrl } from './useAudius';
import { toast } from '@/hooks/use-toast';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover?: string;
  audiusId?: string;
}

export interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  duration: number;
  currentTime: number;
  queue: Track[];
  currentIndex: number;
  isLoading: boolean;
}

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: 80,
    duration: 0,
    currentTime: 0,
    queue: [],
    currentIndex: -1,
    isLoading: false,
  });

  const { streamUrl, loading: streamLoading } = useAudiusStreamUrl(
    state.currentTrack?.audiusId || null
  );

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleTimeUpdate = () => {
      const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        progress,
      }));
    };

    const handleEnded = () => {
      next();
    };

    const handleError = () => {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Playback Error",
        description: "Unable to load this track. Trying next track...",
        variant: "destructive",
      });
      setTimeout(next, 1000);
    };

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Update audio source when stream URL changes
  useEffect(() => {
    if (audioRef.current && streamUrl && state.currentTrack) {
      audioRef.current.src = streamUrl;
      audioRef.current.volume = state.volume / 100;
    }
  }, [streamUrl, state.currentTrack, state.volume]);

  const playTrack = useCallback((track: Track, queue: Track[] = []) => {
    const trackIndex = queue.findIndex(t => t.id === track.id);
    setState(prev => ({
      ...prev,
      currentTrack: track,
      queue: queue.length > 0 ? queue : [track],
      currentIndex: trackIndex >= 0 ? trackIndex : 0,
      isLoading: true,
    }));
  }, []);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !state.currentTrack) return;

    try {
      if (state.isPlaying) {
        audioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: "Unable to play this track.",
        variant: "destructive",
      });
    }
  }, [state.isPlaying, state.currentTrack]);

  const next = useCallback(() => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < state.queue.length) {
      const nextTrack = state.queue[nextIndex];
      setState(prev => ({
        ...prev,
        currentTrack: nextTrack,
        currentIndex: nextIndex,
        isLoading: true,
      }));
    } else {
      // End of queue
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [state.currentIndex, state.queue]);

  const previous = useCallback(() => {
    const prevIndex = state.currentIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = state.queue[prevIndex];
      setState(prev => ({
        ...prev,
        currentTrack: prevTrack,
        currentIndex: prevIndex,
        isLoading: true,
      }));
    }
  }, [state.currentIndex, state.queue]);

  const seek = useCallback((percentage: number) => {
    if (audioRef.current && state.duration) {
      const time = (percentage / 100) * state.duration;
      audioRef.current.currentTime = time;
    }
  }, [state.duration]);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
    toast({
      title: "Added to Queue",
      description: `${track.title} by ${track.artist}`,
    });
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setState(prev => {
      const newQueue = prev.queue.filter(t => t.id !== trackId);
      const removedIndex = prev.queue.findIndex(t => t.id === trackId);
      let newCurrentIndex = prev.currentIndex;
      
      if (removedIndex < prev.currentIndex) {
        newCurrentIndex = prev.currentIndex - 1;
      } else if (removedIndex === prev.currentIndex) {
        // Current track was removed, play next or stop
        if (newQueue.length === 0) {
          return {
            ...prev,
            queue: [],
            currentTrack: null,
            currentIndex: -1,
            isPlaying: false,
          };
        }
        // Keep same index if possible, otherwise go to previous
        newCurrentIndex = Math.min(prev.currentIndex, newQueue.length - 1);
      }

      return {
        ...prev,
        queue: newQueue,
        currentIndex: newCurrentIndex,
        currentTrack: newQueue[newCurrentIndex] || null,
      };
    });
  }, []);

  return {
    ...state,
    isLoading: state.isLoading || streamLoading,
    playTrack,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    addToQueue,
    removeFromQueue,
  };
};
