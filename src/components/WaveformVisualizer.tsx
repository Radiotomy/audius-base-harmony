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
    const baseClasses = "transition-all duration-150";
    
    // Always use real frequency data when available, no fallback animations
    const getBarHeight = (index: number, totalBars: number) => {
      if (analyserData && isPlaying) {
        const dataIndex = Math.floor((index / totalBars) * analyserData.length);
        const value = analyserData[dataIndex] || 0;
        return Math.max(4, (value / 255) * 24 + 4);
      }
      // Silent state - show minimal bars
      return 4;
    };

    const getBarColor = (index: number, totalBars: number) => {
      if (analyserData && isPlaying) {
        const dataIndex = Math.floor((index / totalBars) * analyserData.length);
        const value = analyserData[dataIndex] || 0;
        const intensity = value / 255;
        return `hsl(var(--base-blue) / ${0.3 + intensity * 0.7})`;
      }
      return 'hsl(var(--primary) / 0.3)';
    };
    
    switch (visualizationType) {
      case 'bars':
        return Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded-full`}
            style={{
              width: '2px',
              height: `${getBarHeight(i, 40)}px`,
              backgroundColor: getBarColor(i, 40),
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
            height = 4;
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full`}
              style={{
                width: '3px',
                height: `${height}px`,
                backgroundColor: getBarColor(i, 20),
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
          } else {
            size = 8 + i * 2; // Smaller static circles when not playing
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: getBarColor(i, 5),
              }}
            />
          );
        });
        
      case 'wave':
        return Array.from({ length: 30 }, (_, i) => {
          let height;
          if (analyserData && isPlaying) {
            const dataIndex = Math.floor((i / 30) * analyserData.length);
            const value = analyserData[dataIndex] || 0;
            height = Math.max(4, (value / 255) * 20 + 4);
          } else {
            height = 4;
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full`}
              style={{
                width: '2px',
                height: `${height}px`,
                backgroundColor: getBarColor(i, 30),
              }}
            />
          );
        });
        
      case 'dots':
        return Array.from({ length: 25 }, (_, i) => {
          let opacity;
          let backgroundColor;
          if (analyserData && isPlaying) {
            const dataIndex = Math.floor((i / 25) * analyserData.length);
            const value = analyserData[dataIndex] || 0;
            opacity = 0.3 + (value / 255) * 0.7;
            const intensity = value / 255;
            backgroundColor = `hsl(var(--base-blue) / ${intensity})`;
          } else {
            opacity = 0.3;
            backgroundColor = 'hsl(var(--primary) / 0.3)';
          }
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full`}
              style={{
                width: '4px',
                height: '4px',
                opacity,
                backgroundColor,
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