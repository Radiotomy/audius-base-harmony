import React, { useEffect, useRef } from 'react';

interface RealTimeVisualizerProps {
  isPlaying?: boolean;
  className?: string;
  analyserData?: Uint8Array | null;
  type?: 'bars' | 'spectrum' | 'circular' | 'wave' | 'dots';
}

const RealTimeVisualizer: React.FC<RealTimeVisualizerProps> = ({ 
  isPlaying = false, 
  className = "",
  analyserData = null,
  type = 'bars'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);

  // Keep latest data in a ref
  useEffect(() => {
    dataRef.current = analyserData || null;
  }, [analyserData]);

  const draw = () => {
    const canvas = canvasRef.current;
    const dataArray = dataRef.current;
    if (!canvas || !dataArray) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const drawBars = () => {
      const barCount = 40;
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const barHeight = Math.max(2, amplitude * height * 0.9);
        const hue = 220 + amplitude * 40; // brand-ish blue range
        ctx.fillStyle = `hsl(${hue} 90% 60% / ${0.4 + amplitude * 0.6})`;
        const x = i * barWidth;
        const y = height - barHeight;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      }
    };

    const drawSpectrum = () => {
      const barCount = 28;
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const barHeight = Math.max(2, amplitude * height);
        ctx.fillStyle = `hsl(220 90% 60% / ${0.3 + amplitude * 0.7})`;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }
    };

    const drawCircular = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 2;
      const rings = 5;
      for (let i = 0; i < rings; i++) {
        const dataIndex = Math.floor((i / rings) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const radius = (maxRadius / rings) * (i + 1) * (0.6 + amplitude * 0.5);
        ctx.strokeStyle = `hsl(220 90% 60% / ${0.3 + amplitude * 0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawWave = () => {
      const points = 40;
      const stepX = width / (points - 1);
      ctx.strokeStyle = 'hsl(220 90% 60% / 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const dataIndex = Math.floor((i / points) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const y = height / 2 + (amplitude - 0.5) * height * 0.7;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * stepX, y);
      }
      ctx.stroke();
    };

    const drawDots = () => {
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
        ctx.fillStyle = `hsl(220 90% 60% / ${0.3 + amplitude * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    switch (type) {
      case 'bars':
        drawBars();
        break;
      case 'spectrum':
        drawSpectrum();
        break;
      case 'circular':
        drawCircular();
        break;
      case 'wave':
        drawWave();
        break;
      case 'dots':
        drawDots();
        break;
    }
  };

  // Animate while playing
  useEffect(() => {
    const loop = () => {
      if (isPlaying) draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, type]);

  // Also redraw on data change
  useEffect(() => {
    draw();
  }, [analyserData, type]);

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
