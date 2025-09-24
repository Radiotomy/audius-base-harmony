import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  variant?: 'track' | 'artist' | 'playlist';
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  variant = 'track',
  className 
}) => {
  if (variant === 'track') {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'artist') {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-5 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto mb-4" />
          <Skeleton className="h-9 w-20 mx-auto" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <Skeleton className="w-full h-32 rounded mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
};

export default SkeletonCard;