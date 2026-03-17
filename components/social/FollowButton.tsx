'use client';

import { useEffect, useState } from 'react';
import { followUser, unfollowUser, isFollowing } from '@/lib/follows';
import Button from '@/components/ui/button';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    setLoading(true);
    const following = await isFollowing(userId);
    setIsFollowingUser(following);
    setLoading(false);
  };

  const handleToggleFollow = async () => {
    setLoading(true);
    let success = false;

    if (isFollowingUser) {
      success = await unfollowUser(userId);
    } else {
      success = await followUser(userId);
    }

    if (success) {
      const newFollowingState = !isFollowingUser;
      setIsFollowingUser(newFollowingState);
      onFollowChange?.(newFollowingState);
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`transition ${
        isFollowingUser
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-amber-600 hover:bg-amber-700 text-black'
      }`}
    >
      {loading ? '...' : isFollowingUser ? 'Following ✓' : '+ Follow'}
    </Button>
  );
}
