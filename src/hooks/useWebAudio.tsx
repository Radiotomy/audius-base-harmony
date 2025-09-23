import { useRef, useEffect, useState, useCallback } from 'react';

export interface EQBand {
  frequency: number;
  gain: number;
  Q: number;
}

export interface WebAudioState {
  isInitialized: boolean;
  analyserData: Uint8Array | null;
  eqBands: EQBand[];
}

export const useWebAudio = (audioElement: HTMLAudioElement | null) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const animationFrameRef = useRef<number>();

  const [state, setState] = useState<WebAudioState>({
    isInitialized: false,
    analyserData: null,
    eqBands: [
      { frequency: 32, gain: 0, Q: 1 },
      { frequency: 64, gain: 0, Q: 1 },
      { frequency: 125, gain: 0, Q: 1 },
      { frequency: 250, gain: 0, Q: 1 },
      { frequency: 500, gain: 0, Q: 1 },
      { frequency: 1000, gain: 0, Q: 1 },
      { frequency: 2000, gain: 0, Q: 1 },
      { frequency: 4000, gain: 0, Q: 1 },
      { frequency: 8000, gain: 0, Q: 1 },
      { frequency: 16000, gain: 0, Q: 1 },
    ],
  });

  const initializeWebAudio = useCallback(async () => {
    if (!audioElement || state.isInitialized) return;

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Resume context if suspended (required for some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create source from audio element
      const source = audioContext.createMediaElementSource(audioElement);
      sourceRef.current = source;

      // Create analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create EQ filters
      const filters: BiquadFilterNode[] = [];
      state.eqBands.forEach((band, index) => {
        const filter = audioContext.createBiquadFilter();
        filter.type = index === 0 ? 'lowshelf' : index === 9 ? 'highshelf' : 'peaking';
        filter.frequency.value = band.frequency;
        filter.Q.value = band.Q;
        filter.gain.value = band.gain;
        filters.push(filter);
      });
      eqFiltersRef.current = filters;

      // Connect audio chain: source -> EQ filters -> analyser -> destination
      let previousNode: AudioNode = source;
      filters.forEach(filter => {
        previousNode.connect(filter);
        previousNode = filter;
      });
      previousNode.connect(analyser);
      analyser.connect(audioContext.destination);

      console.log('✅ Web Audio API initialized successfully');
      setState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      console.error('❌ Failed to initialize Web Audio API:', error);
      // Don't set isInitialized to true on error - this allows fallback to normal audio
    }
  }, [audioElement, state.isInitialized]);

  const updateAnalyserData = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    setState(prev => ({ ...prev, analyserData: dataArray }));
    animationFrameRef.current = requestAnimationFrame(updateAnalyserData);
  }, []);

  const setEQGain = useCallback((bandIndex: number, gain: number) => {
    if (eqFiltersRef.current[bandIndex]) {
      eqFiltersRef.current[bandIndex].gain.value = gain;
      setState(prev => ({
        ...prev,
        eqBands: prev.eqBands.map((band, index) => 
          index === bandIndex ? { ...band, gain } : band
        )
      }));
    }
  }, []);

  const resetEQ = useCallback(() => {
    eqFiltersRef.current.forEach(filter => {
      filter.gain.value = 0;
    });
    setState(prev => ({
      ...prev,
      eqBands: prev.eqBands.map(band => ({ ...band, gain: 0 }))
    }));
  }, []);

  // Initialize when audio element is available and user starts playback
  useEffect(() => {
    if (audioElement && !state.isInitialized) {
      // Only initialize Web Audio API when user interacts (required for autoplay policies)
      const initOnFirstPlay = () => {
        initializeWebAudio();
        audioElement.removeEventListener('play', initOnFirstPlay);
      };
      
      audioElement.addEventListener('play', initOnFirstPlay);
      
      return () => {
        audioElement.removeEventListener('play', initOnFirstPlay);
      };
    }
  }, [audioElement, initializeWebAudio, state.isInitialized]);

  // Start/stop analyser updates based on audio playback
  useEffect(() => {
    if (state.isInitialized && audioElement && audioContextRef.current) {
      const handlePlay = async () => {
        try {
          if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
          }
          updateAnalyserData();
        } catch (error) {
          console.error('Error resuming audio context:', error);
        }
      };

      const handlePause = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handlePause);

      return () => {
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handlePause);
      };
    }
  }, [state.isInitialized, audioElement, updateAnalyserData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    setEQGain,
    resetEQ,
    audioContext: audioContextRef.current,
  };
};