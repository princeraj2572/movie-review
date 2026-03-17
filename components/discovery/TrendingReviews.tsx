'use client';

import { useEffect, useState } from 'react';
import { getTrendingReviews } from '@/lib/recommendations';
import Link from 'next/link';
import Badge from '@/components/ui/badge';

interface TrendingReviewsProps {
  limit?: number;
  showTitle?: boolean;
}

export default function TrendingReviews({ limit = 5, showTitle = true }: TrendingReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingReviews();
  }, []);

  const loadTrendingReviews = async () => {
    setLoading(true);
    const trendingReviews = await getTrendingReviews(limit);
    setReviews(trendingReviews);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="w-full">
        {showTitle && <h2 className="text-xl font-bold text-amber-400 mb-4">Trending Reviews</h2>}
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && <h2 className="text-xl font-bold text-amber-400 mb-4">🔥 Trending Reviews</h2>}

      {reviews.length === 0 ? (
        <p className="text-zinc-500 text-sm">No trending reviews yet. Be the first to share!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-lg border border-zinc-700 hover:border-amber-600 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {item.reviews?.title || `Review of Movie ${item.movie_id}`}
                  </h3>
                  <p className="text-xs text-zinc-400">by {item.reviews?.author_name}</p>
                </div>
                <div className="flex gap-1">
                  <Badge className="bg-amber-600 text-black text-xs">
                    ⭐ {item.reviews?.rating}/10
                  </Badge>
                  <Badge className="bg-green-600 text-white text-xs">
                    👍 {item.helpful_count}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-2 mb-2">{item.reviews?.body}</p>
              <div className="flex items-center justify-between">
                <Link
                  href={`/movie/${item.movie_id}`}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  View Movie →
                </Link>
                <span className="text-xs text-zinc-500">
                  Engagement: {item.engagement_score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
