import React, { useRef, useEffect, useState } from 'react';

interface RealTimeVisualizerProps {
  isPlaying?: boolean;
  className?: string;
  audioElement?: HTMLAudioElement | null;
  type?: 'bars' | 'spectrum' | 'circular' | 'wave' | 'dots';
}

const RealTimeVisualizer: React.FC<RealTimeVisualizerProps> = ({ 
  isPlaying = false, 
  className = "",
  audioElement = null,
  type = 'bars'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioElement || isInitialized) return;

    const initAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create analyser
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        // Create source (only once per audio element)
        if (!sourceRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        }
        
        // Connect nodes
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        // Create data array
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        setIsInitialized(true);
        console.log('🎵 Real-time visualizer initialized');
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    // Initialize on user interaction
    const handlePlay = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      if (!isInitialized) {
        initAudio();
      }
    };

    audioElement.addEventListener('play', handlePlay);
    return () => {
      audioElement.removeEventListener('play', handlePlay);
    };
  }, [audioElement, isInitialized]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !isInitialized || !analyserRef.current || !dataArrayRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas || !analyserRef.current || !dataArrayRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw visualization based on type
      drawVisualization(ctx, canvas, dataArrayRef.current, type);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isInitialized, type]);

  const drawVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    dataArray: Uint8Array, 
    visualType: string
  ) => {
    const width = canvas.width;
    const height = canvas.height;
    
    switch (visualType) {
      case 'bars':
        drawBars(ctx, width, height, dataArray);
        break;
      case 'spectrum':
        drawSpectrum(ctx, width, height, dataArray);
        break;
      case 'circular':
        drawCircular(ctx, width, height, dataArray);
        break;
      case 'wave':
        drawWave(ctx, width, height, dataArray);
        break;
      case 'dots':
        drawDots(ctx, width, height, dataArray);
        break;
    }
  };

  const drawBars = (ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const barCount = 40;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;
      const barHeight = Math.max(2, amplitude * height * 0.8);
      
      const hue = (amplitude * 240) + 200; // Blue to purple range
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      
      const x = i * barWidth;
      const y = height - barHeight;
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  };

  const drawSpectrum = (ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const barCount = 20;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;
      const barHeight = Math.max(3, amplitude * height);
      
      const intensity = amplitude * 255;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + amplitude * 0.7})`;
      
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 10;
    
    const rings = 5;
    for (let i = 0; i < rings; i++) {
      const dataIndex = Math.floor((i / rings) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;
      const radius = (maxRadius / rings) * (i + 1) * (0.5 + amplitude * 0.5);
      
      const alpha = 0.3 + amplitude * 0.7;
      ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawWave = (ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const points = 30;
    const stepX = width / points;
    
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < points; i++) {
      const dataIndex = Math.floor((i / points) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;
      const y = height / 2 + (amplitude - 0.5) * height * 0.6;
      
      if (i === 0) {
        ctx.moveTo(0, y);
      } else {
        ctx.lineTo(i * stepX, y);
      }
    }
    
    ctx.stroke();
  };

  const drawDots = (ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    const dotCount = 25;
    const cols = 5;
    const rows = 5;
    const stepX = width / cols;
    const stepY = height / rows;
    
    for (let i = 0; i < dotCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const dataIndex = Math.floor((i / dotCount) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;
      
      const x = col * stepX + stepX / 2;
      const y = row * stepY + stepY / 2;
      const radius = 2 + amplitude * 4;
      
      const alpha = 0.3 + amplitude * 0.7;
      ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={200}
        height={32}
        className="w-full h-full"
        style={{ maxWidth: '200px', height: '32px' }}
      />
    </div>
  );
};

export default RealTimeVisualizer;