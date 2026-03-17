'use client';

import { useEffect, useState } from 'react';
import { getActivityFeed } from '@/lib/activity';
import Link from 'next/link';

interface ActivityFeedProps {
  limit?: number;
  showTitle?: boolean;
}

export default function ActivityFeed({ limit = 20, showTitle = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityFeed();
  }, []);

  const loadActivityFeed = async () => {
    setLoading(true);
    const feed = await getActivityFeed(limit);
    setActivities(feed);
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return '✍️';
      case 'rating':
        return '⭐';
      case 'watchlist':
        return '📋';
      case 'follow':
        return '👤';
      default:
        return '📌';
    }
  };

  const formatActivityMessage = (activity: any) => {
    const username = activity.profiles?.username || 'Someone';
    const timestamp = new Date(activity.created_at);
    const timeAgo = getTimeAgo(timestamp);

    switch (activity.activity_type) {
      case 'review':
        return `${username} wrote a review${activity.description ? `: "${activity.description}"` : ''}`;
      case 'rating':
        return `${username} rated a movie`;
      case 'watchlist':
        return `${username} added to watchlist`;
      case 'follow':
        return `${username} started following`;
      default:
        return activity.description || 'Did something';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full">
      {showTitle && <h2 className="text-xl font-bold text-amber-400 mb-4">Activity Feed</h2>}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-zinc-400">Loading activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500">
            Follow users to see their activity here! Start by following your favorite reviewers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/profile/${activity.profiles?.username}`}
              className="block p-4 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-lg border border-zinc-700 hover:border-amber-600 transition group"
            >
              <div className="flex gap-3">
                <div className="text-2xl">{getActivityIcon(activity.activity_type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-white group-hover:text-amber-400 transition">
                    {formatActivityMessage(activity)}
                  </p>
                  {activity.profiles?.username && (
                    <p className="text-xs text-zinc-500 mt-1">@{activity.profiles.username}</p>
                  )}
                </div>
                <span className="text-xs text-zinc-500">
                  {getTimeAgo(new Date(activity.created_at))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
