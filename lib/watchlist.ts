import { supabase } from './supabase'

export type WatchStatus = 'want' | 'watching' | 'watched'

export interface WatchlistItem {
  id: string
  user_id: string
  movie_id: number
  movie_title: string
  movie_poster: string
  status: WatchStatus
  created_at: string
}

// Get all watchlist items for current user
export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  const { data } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

// Get watchlist status for a specific movie
export async function getMovieWatchStatus(userId: string, movieId: number): Promise<WatchStatus | null> {
  const { data } = await supabase
    .from('watchlist')
    .select('status')
    .eq('user_id', userId)
    .eq('movie_id', movieId)
    .single()
  return data?.status || null
}

// Add or update movie in watchlist
export async function upsertWatchlist(
  userId: string,
  movieId: number,
  movieTitle: string,
  moviePoster: string,
  status: WatchStatus
): Promise<boolean> {
  const { error } = await supabase
    .from('watchlist')
    .upsert(
      { user_id: userId, movie_id: movieId, movie_title: movieTitle, movie_poster: moviePoster, status },
      { onConflict: 'user_id,movie_id' }
    )
  return !error
}

// Remove movie from watchlist
export async function removeFromWatchlist(userId: string, movieId: number): Promise<boolean> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId)
  return !error
}

// Get watchlist counts by status
export async function getWatchlistCounts(userId: string) {
  const { data } = await supabase
    .from('watchlist')
    .select('status')
    .eq('user_id', userId)

  const counts = { want: 0, watching: 0, watched: 0, total: 0 }
  data?.forEach(item => {
    counts[item.status as WatchStatus]++
    counts.total++
  })
  return counts
}
