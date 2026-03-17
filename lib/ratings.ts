import { supabase } from './supabase'
import { getSessionId } from './session'

// Get the current user's rating for a movie
export async function getUserRating(movieId: number): Promise<number | null> {
  const sessionId = getSessionId()
  const { data } = await supabase
    .from('user_ratings')
    .select('rating')
    .eq('movie_id', movieId)
    .eq('session_id', sessionId)
    .single()

  return data?.rating ?? null
}

// Save or update user's rating
export async function saveUserRating(movieId: number, rating: number): Promise<boolean> {
  const sessionId = getSessionId()

  const { error } = await supabase
    .from('user_ratings')
    .upsert(
      { movie_id: movieId, session_id: sessionId, rating },
      { onConflict: 'movie_id,session_id' }
    )

  return !error
}

// Remove user's rating
export async function removeUserRating(movieId: number): Promise<boolean> {
  const sessionId = getSessionId()
  const { error } = await supabase
    .from('user_ratings')
    .delete()
    .eq('movie_id', movieId)
    .eq('session_id', sessionId)

  return !error
}

// Get community average + count for a movie
export async function getCommunityRating(movieId: number): Promise<{ average: number; count: number }> {
  const { data } = await supabase
    .from('user_ratings')
    .select('rating')
    .eq('movie_id', movieId)

  if (!data || data.length === 0) return { average: 0, count: 0 }
  const avg = data.reduce((s, r) => s + r.rating, 0) / data.length
  return { average: Math.round(avg * 10) / 10, count: data.length }
}
