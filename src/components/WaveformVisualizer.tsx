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
    <div className={`waveform-bars ${className}`}>
      {bars.map((bar) => (
        <div
          key={bar}
          className={`waveform-bar ${isPlaying ? 'animate-waveform-dance' : ''}`}
          style={{
            height: `${Math.random() * 32 + 4}px`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;