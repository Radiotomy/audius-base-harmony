import React, { useState, useEffect } from 'react';

interface WaveformVisualizerProps {
  isPlaying?: boolean;
  className?: string;
  analyserData?: Uint8Array | null;
}

type VisualizationType = 'bars' | 'spectrum' | 'circular' | 'wave' | 'dots';

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isPlaying = false, 
  className = "",
  analyserData = null
}) => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('bars');

  useEffect(() => {
    const saved = localStorage.getItem('waveform-type') as VisualizationType;
    if (saved && ['bars', 'spectrum', 'circular', 'wave', 'dots'].includes(saved)) {
      setVisualizationType(saved);
    }
  }, []);

  const cycleVisualization = () => {
    const types: VisualizationType[] = ['bars', 'spectrum', 'circular', 'wave', 'dots'];
    const currentIndex = types.indexOf(visualizationType);
    const nextIndex = (currentIndex + 1) % types.length;
    const nextType = types[nextIndex];
    setVisualizationType(nextType);
    localStorage.setItem('waveform-type', nextType);
  };

  const renderVisualization = () => {
    const baseClasses = "transition-all duration-150 bg-primary/60";
    
    // Use real frequency data if available, otherwise fallback to animated bars
    const getBarHeight = (index: number, totalBars: number) => {
      if (analyserData && isPlaying) {
        const dataIndex = Math.floor((index / totalBars) * analyserData.length);
        const value = analyserData[dataIndex] || 0;
        return Math.max(4, (value / 255) * 24 + 4);
      }
      return Math.random() * 24 + 4;
    };
    
    switch (visualizationType) {
      case 'bars':
        return Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded-full ${
              !analyserData && isPlaying ? 'animate-waveform-dance' : ''
            }`}
            style={{
              width: '2px',
              height: `${getBarHeight(i, 40)}px`,
              animationDelay: !analyserData ? `${Math.random() * 0.8}s` : undefined,
            }}
          />
        ));
        
      case 'spectrum':
        return Array.from({ length: 20 }, (_, i) => {
          let height;
          if (analyserData && isPlaying) {
            const dataIndex = Math.floor((i / 20) * analyserData.length);
            const value = analyserData[dataIndex] || 0;
            height = Math.max(4, (value / 255) * 28 + 4);
          } else {
            const centerDistance = Math.abs(i - 10);
            height = Math.max(4, 28 - centerDistance * 2);
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full ${
                !analyserData && isPlaying ? 'animate-frequency-spectrum' : ''
              }`}
              style={{
                width: '3px',
                height: `${height}px`,
                animationDelay: !analyserData ? `${i * 0.05}s` : undefined,
              }}
            />
          );
        });
        
      case 'circular':
        return Array.from({ length: 5 }, (_, i) => {
          let size = 8 + i * 4;
          if (analyserData && isPlaying) {
            const dataIndex = Math.floor((i / 5) * analyserData.length);
            const value = analyserData[dataIndex] || 0;
            const scale = 0.8 + (value / 255) * 0.4;
            size = size * scale;
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full ${
                !analyserData && isPlaying ? 'animate-circular-pulse' : ''
              }`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: !analyserData ? `${i * 0.2}s` : undefined,
              }}
            />
          );
        });
        
      case 'wave':
        return Array.from({ length: 30 }, (_, i) => {
          let height = 16;
          if (analyserData && isPlaying) {
            const dataIndex = Math.floor((i / 30) * analyserData.length);
            const value = analyserData[dataIndex] || 0;
            height = Math.max(4, (value / 255) * 20 + 4);
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full ${
                !analyserData && isPlaying ? 'animate-line-wave' : ''
              }`}
              style={{
                width: '2px',
                height: `${height}px`,
                animationDelay: !analyserData ? `${i * 0.03}s` : undefined,
              }}
            />
          );
        });
        
      case 'dots':
        return Array.from({ length: 25 }, (_, i) => {
          let opacity = 0.6;
          if (analyserData && isPlaying) {
            const dataIndex = Math.floor((i / 25) * analyserData.length);
            const value = analyserData[dataIndex] || 0;
            opacity = 0.3 + (value / 255) * 0.7;
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full ${
                !analyserData && isPlaying ? 'animate-beat-dots' : ''
              }`}
              style={{
                width: '4px',
                height: '4px',
                opacity: analyserData && isPlaying ? opacity : undefined,
                animationDelay: !analyserData ? `${Math.random() * 0.6}s` : undefined,
              }}
            />
          );
        });
        
      default:
        return null;
    }
  };

  return (
    <div 
      className={`flex items-center justify-center gap-0.5 h-8 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={cycleVisualization}
      title="Click to change visualization"
    >
      {renderVisualization()}
    </div>
  );
};

export default WaveformVisualizer;