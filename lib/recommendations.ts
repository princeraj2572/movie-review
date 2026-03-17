import { supabase } from './supabase'
import { fetchMoviesByGenre, fetchPopularMovies, GENRE_LIST, type TMDBMovie } from './tmdb'

// Get user's top rated genres from their ratings
export async function getUserTopGenres(userId: string): Promise<number[]> {
  // Get movies the user has rated highly (7+)
  const { data: ratings } = await supabase
    .from('user_ratings')
    .select('movie_id, rating')
    .eq('session_id', userId)
    .gte('rating', 7)
    .order('rating', { ascending: false })
    .limit(20)

  if (!ratings || ratings.length === 0) return []

  // We'd need genre data per movie — for now return popular genre IDs
  // In a real app you'd store genre_ids when rating
  return []
}

// Get recommendations based on genres
export async function getRecommendationsByGenres(
  genreIds: number[],
  excludeMovieIds: number[] = [],
  limit = 12
): Promise<TMDBMovie[]> {
  if (genreIds.length === 0) {
    // Default: return popular movies
    const movies = await fetchPopularMovies(1)
    return movies.filter(m => !excludeMovieIds.includes(m.id)).slice(0, limit)
  }

  // Fetch from top genres
  const results: TMDBMovie[] = []
  for (const genreId of genreIds.slice(0, 3)) {
    const movies = await fetchMoviesByGenre(genreId, 1)
    results.push(...movies)
  }

  // Deduplicate and exclude already watched
  const seen = new Set<number>()
  return results
    .filter(m => {
      if (seen.has(m.id) || excludeMovieIds.includes(m.id)) return false
      seen.add(m.id)
      return true
    })
    .slice(0, limit)
}

// Get "Because you like X genre" recommendations
export async function getGenreRecommendations(genreId: number, excludeIds: number[] = []): Promise<TMDBMovie[]> {
  const movies = await fetchMoviesByGenre(genreId, 1)
  return movies.filter(m => !excludeIds.includes(m.id)).slice(0, 8)
}

// Get popular recommendations (for logged-out users)
export async function getPopularRecommendations(): Promise<TMDBMovie[]> {
  return fetchPopularMovies(1)
}

// Where to watch - uses TMDB watch providers
export async function getWatchProviders(movieId: number, country = 'IN'): Promise<{
  flatrate: { name: string; logo: string }[]
  rent: { name: string; logo: string }[]
  buy: { name: string; logo: string }[]
} | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '0edd8c72eb9be23672f0f30361ab5d47'
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )
    const data = await res.json()
    const countryData = data.results?.[country]
    if (!countryData) {
      // Fallback to US
      const usData = data.results?.['US']
      if (!usData) return null
      return formatProviders(usData)
    }
    return formatProviders(countryData)
  } catch {
    return null
  }
}

function formatProviders(data: any) {
  const format = (providers: any[]) =>
    (providers || []).map((p: any) => ({
      name: p.provider_name,
      logo: `https://image.tmdb.org/t/p/original${p.logo_path}`
    }))

  return {
    flatrate: format(data.flatrate),
    rent: format(data.rent),
    buy: format(data.buy)
  }
}

// ====== NEW DISCOVERY & RECOMMENDATIONS FEATURES ======

// Get trending movies (based on recent reviews and ratings)
export async function getTrendingMovies(limit: number = 20): Promise<any[]> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('reviews')
    .select('movie_id')
    .gte('created_at', oneWeekAgo)
    .limit(limit);

  if (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }

  // Group by movie_id and count
  const movieCounts = new Map<number, number>();
  data?.forEach((review: any) => {
    movieCounts.set(review.movie_id, (movieCounts.get(review.movie_id) || 0) + 1);
  });

  // Sort by count and return top movies
  return Array.from(movieCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([movieId]) => ({ movie_id: movieId }));
}

// Get trending reviews (most helpful and engaged)
export async function getTrendingReviews(limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('trending_reviews')
    .select(`
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
    `)
    .order('engagement_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trending reviews:', error);
    return [];
  }

  return data || [];
}

// Mark a review as trending
export async function markReviewAsTrending(reviewId: string, movieId: number): Promise<boolean> {
  const { error } = await supabase
    .from('trending_reviews')
    .insert([
      {
        review_id: reviewId,
        movie_id: movieId,
        helpful_count: 0,
        engagement_score: 0,
      },
    ])
    .on('*', () => {});

  if (error && error.code !== '23505') {
    console.error('Error marking review as trending:', error);
    return false;
  }

  return true;
}

// Update trending review engagement score
export async function updateTrendingReviewScore(
  reviewId: string,
  helpfulCount: number,
  engagementScore: number
): Promise<boolean> {
  const { error } = await supabase
    .from('trending_reviews')
    .update({
      helpful_count: helpfulCount,
      engagement_score: engagementScore,
      updated_at: new Date().toISOString(),
    })
    .eq('review_id', reviewId);

  if (error) {
    console.error('Error updating trending review score:', error);
    return false;
  }

  return true;
}
