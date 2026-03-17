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
