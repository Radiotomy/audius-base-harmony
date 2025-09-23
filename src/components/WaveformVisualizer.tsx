import React, { useState, useEffect } from 'react';

interface WaveformVisualizerProps {
  isPlaying?: boolean;
  className?: string;
}

type VisualizationType = 'bars' | 'spectrum' | 'circular' | 'wave' | 'dots';

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isPlaying = false, 
  className = "" 
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
    
    switch (visualizationType) {
      case 'bars':
        return Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded-full ${
              isPlaying ? 'animate-waveform-dance' : ''
            }`}
            style={{
              width: '2px',
              height: `${Math.random() * 24 + 4}px`,
              animationDelay: `${Math.random() * 0.8}s`,
            }}
          />
        ));
        
      case 'spectrum':
        return Array.from({ length: 20 }, (_, i) => {
          const centerDistance = Math.abs(i - 10);
          const height = Math.max(4, 28 - centerDistance * 2);
          return (
            <div
              key={i}
              className={`${baseClasses} rounded-full ${
                isPlaying ? 'animate-frequency-spectrum' : ''
              }`}
              style={{
                width: '3px',
                height: `${height}px`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          );
        });
        
      case 'circular':
        return Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded-full ${
              isPlaying ? 'animate-circular-pulse' : ''
            }`}
            style={{
              width: `${8 + i * 4}px`,
              height: `${8 + i * 4}px`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ));
        
      case 'wave':
        return Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded-full ${
              isPlaying ? 'animate-line-wave' : ''
            }`}
            style={{
              width: '2px',
              height: '16px',
              animationDelay: `${i * 0.03}s`,
            }}
          />
        ));
        
      case 'dots':
        return Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} rounded-full ${
              isPlaying ? 'animate-beat-dots' : ''
            }`}
            style={{
              width: '4px',
              height: '4px',
              animationDelay: `${Math.random() * 0.6}s`,
            }}
          />
        ));
        
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