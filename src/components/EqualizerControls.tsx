import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { EQBand } from '@/hooks/useWebAudio';

interface EqualizerControlsProps {
  eqBands: EQBand[];
  onGainChange: (bandIndex: number, gain: number) => void;
  onReset: () => void;
}

const EqualizerControls: React.FC<EqualizerControlsProps> = ({
  eqBands,
  onGainChange,
  onReset,
}) => {
  const formatFrequency = (frequency: number) => {
    if (frequency >= 1000) {
      return `${frequency / 1000}k`;
    }
    return frequency.toString();
  };

  return (
    <div className="w-full bg-card/50 rounded-lg p-3 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">10-Band Equalizer</h4>
        <Button
          onClick={onReset}
          variant="ghost"
          size="sm"
          className="h-6 px-2"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="flex items-end justify-between gap-1 h-24">
        {eqBands.map((band, index) => (
          <div key={band.frequency} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="text-xs text-muted-foreground font-mono truncate text-center w-full">
              {formatFrequency(band.frequency)}
            </div>
            <div className="h-16 flex items-end">
              <Slider
                value={[band.gain]}
                onValueChange={(values) => onGainChange(index, values[0])}
                min={-12}
                max={12}
                step={0.5}
                orientation="vertical"
                className="h-full"
              />
            </div>
            <div className="text-xs text-muted-foreground font-mono text-center w-full truncate">
              {band.gain >= 0 ? '+' : ''}{band.gain.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
        <span>-12dB</span>
        <span>0dB</span>
        <span>+12dB</span>
      </div>
    </div>
  );
};

export default EqualizerControls;