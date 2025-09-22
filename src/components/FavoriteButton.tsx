import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  trackId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  trackId, 
  size = 'sm', 
  variant = 'ghost',
  className 
}) => {
  const { toggleFavorite, isFavorited, loading } = useFavorites();
  
  const favorited = isFavorited(trackId);

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(trackId);
      }}
      disabled={loading}
      className={cn(className)}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          favorited ? "fill-red-500 text-red-500" : "text-muted-foreground",
          size === 'sm' && "h-3 w-3",
          size === 'lg' && "h-5 w-5"
        )} 
      />
    </Button>
  );
};

export default FavoriteButton;