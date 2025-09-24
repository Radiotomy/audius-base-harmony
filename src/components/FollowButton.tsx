import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';
import LoadingSpinner from '@/components/LoadingSpinner';

interface FollowButtonProps {
  userId: string;
  username?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  username = 'user',
  variant = 'default',
  size = 'default',
  className
}) => {
  const { followUser, unfollowUser, isFollowing, loading } = useSocial();
  const following = isFollowing(userId);

  const handleToggleFollow = async () => {
    if (following) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <LoadingSpinner size="sm" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggleFollow}
      variant={following ? 'outline' : variant}
      size={size}
      className={className}
    >
      {following ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;