import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { audiusService } from '@/services/audius';
import { useWebAudio } from '@/hooks/useWebAudio';
import { toast } from '@/hooks/use-toast';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover?: string;
  audiusId?: string;
}

export type RepeatMode = 'none' | 'track' | 'playlist';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  duration: number;
  currentTime: number;
  queue: Track[];
  currentIndex: number;
  isLoading: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  playbackSpeed: number;
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
  originalQueue: Track[];
}

interface PlayerContextType extends PlayerState {
  play: (track: Track, queue?: Track[], autoPlay?: boolean) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => void;
  previous: () => void;
  seek: (percentage: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setCrossfade: (enabled: boolean, duration?: number) => void;
  clearQueue: () => void;
  webAudio: {
    isInitialized: boolean;
    analyserData: Uint8Array | null;
    eqBands: Array<{ frequency: number; gain: number; Q: number }>;
    setEQGain: (bandIndex: number, gain: number) => void;
    resetEQ: () => void;
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
  };
  audioElement: HTMLAudioElement | null;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: typeof window !== 'undefined' ? parseInt(localStorage.getItem('audiobase-volume') || '70') : 70,
    duration: 0,
    currentTime: 0,
    queue: [],
    currentIndex: -1,
    isLoading: false,
    repeatMode: 'none',
    isShuffled: false,
    playbackSpeed: 1.0,
    crossfadeEnabled: false,
    crossfadeDuration: 3,
    originalQueue: [],
  });

  // Initialize Web Audio API
  const webAudio = useWebAudio(audioRef.current);

  // Initialize audio element on mount
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'none';
      audio.setAttribute('playsinline', 'true');
      audio.volume = state.volume / 100;
      audioRef.current = audio;

      console.log('🎵 Audio element initialized with CORS support');

      // Set up event listeners
      const handleLoadedMetadata = () => {
        console.log('📊 Audio metadata loaded, duration:', audio.duration);
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
        console.log('🔚 Track ended, checking repeat mode');
        setState(prev => {
          if (prev.repeatMode === 'track') {
            audio.currentTime = 0;
            audio.play();
            return prev;
          } else {
            // Call next with current state
            const nextIndex = prev.currentIndex + 1;
            if (nextIndex < prev.queue.length) {
              console.log('🎵 Auto-playing next track:', prev.queue[nextIndex].title);
              // Use setTimeout to avoid state conflicts
              setTimeout(() => {
                const nextTrack = prev.queue[nextIndex];
                play(nextTrack, prev.queue, true);
              }, 100);
            } else if (prev.repeatMode === 'playlist' && prev.queue.length > 0) {
              console.log('🔄 Restarting playlist');
              setTimeout(() => {
                const firstTrack = prev.queue[0];
                play(firstTrack, prev.queue, true);
              }, 100);
            } else {
              console.log('🔚 End of queue reached');
              return { ...prev, isPlaying: false };
            }
            return prev;
          }
        });
      };

      const handleError = (e: Event) => {
        console.error('❌ Audio error:', e);
        setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
        toast({
          title: "Playback Error",
          description: "Unable to load this track. Trying next track...",
          variant: "destructive",
        });
        setTimeout(() => next(), 1000);
      };

      const handleLoadStart = () => {
        console.log('⏳ Loading audio...');
        setState(prev => ({ ...prev, isLoading: true }));
      };

      const handleCanPlay = () => {
        console.log('✅ Audio ready to play');
        setState(prev => ({ ...prev, isLoading: false }));
      };

      const handlePlay = () => {
        console.log('▶️ Audio started playing');
        setState(prev => ({ ...prev, isPlaying: true }));
      };

      const handlePause = () => {
        console.log('⏸️ Audio paused');
        setState(prev => ({ ...prev, isPlaying: false }));
      };

      // Attach event listeners
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      // Cleanup function
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  // Fetch stream URL and play (in single gesture)
  const play = useCallback(async (track: Track, queue: Track[] = [], autoPlay: boolean = true) => {
    console.log('🎯 Play requested:', track.title, 'autoPlay:', autoPlay);
    
    if (!audioRef.current || !track.audiusId) {
      console.error('❌ No audio element or Audius ID');
      return;
    }

    const audio = audioRef.current;
    
    // Stop current audio
    audio.pause();
    audio.currentTime = 0;

    // Update state immediately for UI responsiveness
    const trackIndex = queue.findIndex(t => t.id === track.id);
    setState(prev => ({
      ...prev,
      currentTrack: track,
      queue: queue.length > 0 ? queue : [track],
      currentIndex: trackIndex >= 0 ? trackIndex : 0,
      isLoading: true,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
    }));

    try {
      // Fetch stream URL within the same user gesture
      console.log('🔗 Fetching stream URL for:', track.audiusId);
      const streamUrl = await audiusService.getStreamUrl(track.audiusId);
      
      if (!streamUrl) {
        throw new Error('No stream URL received');
      }

      console.log('✅ Stream URL received:', streamUrl);
      
      // Set audio source and properties
      audio.src = streamUrl;
      audio.volume = state.volume / 100;

      if (autoPlay) {
        try {
          // Play immediately within the gesture
          await audio.play();
          console.log('🎵 Auto-play successful');
        } catch (error) {
          console.warn('⚠️ Auto-play blocked, user needs to click play:', error);
          setState(prev => ({ ...prev, isLoading: false }));
          toast({
            title: "Tap Play to Start",
            description: "Your browser requires user interaction to play audio.",
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('❌ Failed to load track:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Playback Error",
        description: "Unable to load this track.",
        variant: "destructive",
      });
    }
  }, [state.volume]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !state.currentTrack) return;

    try {
      if (state.isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('❌ Toggle play error:', error);
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
      play(nextTrack, state.queue, true);
    } else if (state.repeatMode === 'playlist' && state.queue.length > 0) {
      // Restart playlist
      const firstTrack = state.queue[0];
      play(firstTrack, state.queue, true);
    } else {
      console.log('🔚 End of queue reached');
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [state.currentIndex, state.queue, state.repeatMode, play]);

  const previous = useCallback(() => {
    const prevIndex = state.currentIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = state.queue[prevIndex];
      play(prevTrack, state.queue, true);
    }
  }, [state.currentIndex, state.queue, play]);

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
    // Save volume to localStorage
    localStorage.setItem('audiobase-volume', volume.toString());
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
        if (newQueue.length === 0) {
          return {
            ...prev,
            queue: [],
            currentTrack: null,
            currentIndex: -1,
            isPlaying: false,
          };
        }
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

  const shuffleArray = useCallback((array: Track[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setState(prev => ({ ...prev, repeatMode: mode }));
    toast({
      title: "Repeat Mode",
      description: `Repeat ${mode === 'none' ? 'off' : mode === 'track' ? 'track' : 'playlist'}`,
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setState(prev => {
      if (!prev.isShuffled) {
        // Enable shuffle
        const currentTrack = prev.currentTrack;
        const shuffledQueue = shuffleArray(prev.queue);
        const newIndex = currentTrack ? shuffledQueue.findIndex(t => t.id === currentTrack.id) : -1;
        
        return {
          ...prev,
          isShuffled: true,
          originalQueue: prev.queue,
          queue: shuffledQueue,
          currentIndex: newIndex,
        };
      } else {
        // Disable shuffle
        const currentTrack = prev.currentTrack;
        const originalIndex = currentTrack ? prev.originalQueue.findIndex(t => t.id === currentTrack.id) : -1;
        
        return {
          ...prev,
          isShuffled: false,
          queue: prev.originalQueue,
          currentIndex: originalIndex,
          originalQueue: [],
        };
      }
    });

    toast({
      title: "Shuffle",
      description: state.isShuffled ? "Shuffle off" : "Shuffle on",
    });
  }, [state.isShuffled, shuffleArray]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, playbackSpeed: speed }));
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    toast({
      title: "Playback Speed",
      description: `${speed}x speed`,
    });
  }, []);

  const setCrossfade = useCallback((enabled: boolean, duration: number = 3) => {
    setState(prev => ({ 
      ...prev, 
      crossfadeEnabled: enabled,
      crossfadeDuration: duration 
    }));
    toast({
      title: "Crossfade",
      description: enabled ? `Enabled (${duration}s)` : "Disabled",
    });
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queue: prev.currentTrack ? [prev.currentTrack] : [],
      originalQueue: [],
      currentIndex: prev.currentTrack ? 0 : -1,
      isShuffled: false,
    }));
    toast({
      title: "Queue Cleared",
      description: "All tracks removed from queue",
    });
  }, []);

  // Apply playback speed when audio element changes
  useEffect(() => {
    if (audioRef.current && state.playbackSpeed !== 1.0) {
      audioRef.current.playbackRate = state.playbackSpeed;
    }
  }, [state.currentTrack, state.playbackSpeed]);

  const value: PlayerContextType = {
    ...state,
    play,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    addToQueue,
    removeFromQueue,
    setRepeatMode,
    toggleShuffle,
    setPlaybackSpeed,
    setCrossfade,
    clearQueue,
    webAudio,
    audioElement: audioRef.current,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};