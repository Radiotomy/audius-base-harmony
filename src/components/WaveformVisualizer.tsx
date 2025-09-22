import React from 'react';

interface WaveformVisualizerProps {
  isPlaying?: boolean;
  className?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isPlaying = false, 
  className = "" 
}) => {
  const bars = Array.from({ length: 40 }, (_, i) => i);
  
  return (
    <div className={`flex items-end justify-center gap-0.5 h-8 ${className}`}>
      {bars.map((bar) => (
        <div
          key={bar}
          className={`bg-primary/60 rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            width: '2px',
            height: `${Math.random() * 24 + 4}px`,
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;