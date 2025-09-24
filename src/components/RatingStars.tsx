import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  userRating?: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  userRating,
  onRate,
  readonly = false,
  size = 'md',
  showCount = false,
  count,
  className
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const iconSize = sizeClasses[size];

  const renderStars = () => {
    const stars = [];
    const displayRating = userRating !== null && userRating !== undefined ? userRating : rating;
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= displayRating;
      const halfFilled = i === Math.ceil(displayRating) && displayRating % 1 !== 0;

      stars.push(
        <button
          key={i}
          onClick={() => !readonly && onRate?.(i)}
          disabled={readonly}
          className={cn(
            "transition-colors",
            !readonly && "hover:text-yellow-400 cursor-pointer",
            readonly && "cursor-default"
          )}
          title={readonly ? `${displayRating.toFixed(1)} stars` : `Rate ${i} star${i !== 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              iconSize,
              filled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground",
              halfFilled && "text-yellow-400 fill-yellow-400/50"
            )}
          />
        </button>
      );
    }
    
    return stars;
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      
      {showCount && count !== undefined && (
        <span className="text-sm text-muted-foreground ml-2">
          ({count})
        </span>
      )}
      
      {!readonly && userRating && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRate?.(0)}
          className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default RatingStars;