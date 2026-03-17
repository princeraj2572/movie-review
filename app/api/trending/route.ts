import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'getTrending':
        return await handleGetTrending(data);
      case 'markAsTrending':
        return await handleMarkAsTrending(data);
      case 'updateScore':
        return await handleUpdateScore(data);
      case 'getTrendingMovies':
        return await handleGetTrendingMovies(data);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGetTrending(data: any) {
  const { limit = 10 } = data;

  const { data: trending, error } = await supabase
    .from('trending_reviews')
    .select(
      `
      id,
      review_id,
      movie_id,
      helpful_count,
      engagement_score,
      trend_date,
      reviews (
        id,
        title,
        body,
        rating,
        author_name,
        helpful,
        not_helpful
      )
    `
    )
    .order('engagement_score', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(trending || []);
}

async function handleMarkAsTrending(data: any) {
  const { review_id, movie_id } = data;

  const { data: trending, error } = await supabase
    .from('trending_reviews')
    .insert([
      {
        review_id,
        movie_id,
        helpful_count: 0,
        engagement_score: 0,
      },
    ])
    .select()
    .single();

  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(trending || { success: true });
}

async function handleUpdateScore(data: any) {
  const { review_id, helpful_count, engagement_score } = data;

  const { data: updated, error } = await supabase
    .from('trending_reviews')
    .update({
      helpful_count,
      engagement_score,
      updated_at: new Date().toISOString(),
    })
    .eq('review_id', review_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(updated);
}

async function handleGetTrendingMovies(data: any) {
  const { limit = 20 } = data;

  // Get reviews from the last 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('movie_id')
    .gte('created_at', oneWeekAgo)
    .limit(limit * 2);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Group by movie_id and count
  const movieCounts = new Map<number, number>();
  reviews?.forEach((review: any) => {
    movieCounts.set(review.movie_id, (movieCounts.get(review.movie_id) || 0) + 1);
  });

  // Sort by count and return
  const trendingMovies = Array.from(movieCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([movieId, count]) => ({ movie_id: movieId, review_count: count }));

  return NextResponse.json(trendingMovies);
}
