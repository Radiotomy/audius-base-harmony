import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Zap } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

interface Artist {
  id: string;
  name: string;
  followers: string;
  verified?: boolean;
  avatar?: string;
  genre?: string;
  topTrack?: string;
}

interface ArtistCardProps {
  artist: Artist;
  onPlay?: () => void;
  onTip?: (artist: Artist) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onPlay, onTip }) => {
  return (
    <Card className="p-4 shadow-card bg-card hover:shadow-glow transition-smooth group">
      <div className="space-y-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold">
            {artist.avatar ? (
              <img src={artist.avatar} alt={artist.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              artist.name.charAt(0)
            )}
          </div>
          {artist.verified && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          )}
        </div>

        {/* Artist Info */}
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
            {artist.name}
          </h3>
          <p className="text-sm text-muted-foreground">{artist.followers} followers</p>
          {artist.genre && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {artist.genre}
            </Badge>
          )}
        </div>

        {/* Top Track */}
        {artist.topTrack && (
          <div className="text-xs text-muted-foreground">
            <span className="text-accent">♪</span> {artist.topTrack}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onPlay}
            size="sm" 
            className="flex-1 gradient-primary hover:scale-105 transition-bounce"
          >
            <Play className="h-3 w-3 mr-1" />
            Play
          </Button>
          <Button 
            onClick={() => onTip?.(artist)}
            variant="outline" 
            size="sm"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-smooth"
          >
            <Zap className="h-3 w-3 mr-1" />
            Tip
          </Button>
          <FavoriteButton trackId={artist.id} />
        </div>
      </div>
    </Card>
  );
};

export default ArtistCard;