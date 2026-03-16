import { supabase } from './supabase'
import { getSessionId } from './session'

export interface Review {
  id: string
  movie_id: number
  author_name: string
  rating: number
  title: string
  body: string
  is_spoiler: boolean
  is_critic: boolean
  helpful: number
  not_helpful: number
  created_at: string
  user_vote?: 'up' | 'down' | null
}

export interface NewReview {
  movie_id: number
  author_name: string
  rating: number
  title: string
  body: string
  is_spoiler: boolean
}

// Fetch all reviews for a movie
export async function getReviews(movieId: number): Promise<Review[]> {
  const sessionId = getSessionId()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false })

  if (error || !reviews) return []

  // Fetch this user's helpful votes for these reviews
  const reviewIds = reviews.map(r => r.id)
  const { data: votes } = await supabase
    .from('helpful_votes')
    .select('review_id, vote')
    .eq('session_id', sessionId)
    .in('review_id', reviewIds)

  const voteMap: Record<string, 'up' | 'down'> = {}
  votes?.forEach(v => { voteMap[v.review_id] = v.vote })

  return reviews.map(r => ({ ...r, user_vote: voteMap[r.id] || null }))
}

// Submit a new review
export async function addReview(review: NewReview): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single()

  if (error) {
    console.error('Error adding review:', error)
    return null
  }
  return data
}

// Vote helpful/not helpful on a review
export async function voteHelpful(reviewId: string, vote: 'up' | 'down'): Promise<boolean> {
  const sessionId = getSessionId()

  // Check if user already voted
  const { data: existing } = await supabase
    .from('helpful_votes')
    .select('id, vote')
    .eq('review_id', reviewId)
    .eq('session_id', sessionId)
    .single()

  if (existing) {
    // Same vote - remove it (toggle off)
    if (existing.vote === vote) {
      await supabase.from('helpful_votes').delete().eq('id', existing.id)
      // Decrement count
      const field = vote === 'up' ? 'helpful' : 'not_helpful'
      const { data: review } = await supabase.from('reviews').select(field).eq('id', reviewId).single()
      if (review) {
        const currentCount = (review as Record<string, number>)[field] || 0
        await supabase.from('reviews').update({ [field]: Math.max(0, currentCount - 1) }).eq('id', reviewId)
      }
      return true
    }
    // Different vote - update it
    await supabase.from('helpful_votes').update({ vote }).eq('id', existing.id)
    // Swap counts
    const addField = vote === 'up' ? 'helpful' : 'not_helpful'
    const removeField = vote === 'up' ? 'not_helpful' : 'helpful'
    const { data: review } = await supabase.from('reviews').select('helpful, not_helpful').eq('id', reviewId).single()
    if (review) {
      const typedReview = review as Record<string, number>
      await supabase.from('reviews').update({
        [addField]: typedReview[addField] + 1,
        [removeField]: Math.max(0, typedReview[removeField] - 1)
      }).eq('id', reviewId)
    }
    return true
  }

  // New vote
  const { error } = await supabase.from('helpful_votes').insert([{ review_id: reviewId, session_id: sessionId, vote }])
  if (error) return false

  // Increment count
  const field = vote === 'up' ? 'helpful' : 'not_helpful'
  const { data: review } = await supabase.from('reviews').select(field).eq('id', reviewId).single()
  if (review) {
    const currentCount = (review as Record<string, number>)[field] || 0
    await supabase.from('reviews').update({ [field]: currentCount + 1 }).eq('id', reviewId)
  }
  return true
}

// Get average rating from all user ratings for a movie
export async function getMovieRatingStats(movieId: number): Promise<{ average: number; count: number }> {
  const { data } = await supabase
    .from('user_ratings')
    .select('rating')
    .eq('movie_id', movieId)

  if (!data || data.length === 0) return { average: 0, count: 0 }

  const sum = data.reduce((acc, r) => acc + r.rating, 0)
  return { average: Math.round((sum / data.length) * 10) / 10, count: data.length }
}

// Get rating histogram (how many rated 1, 2, 3 ... 10)
export async function getRatingHistogram(movieId: number): Promise<Record<number, number>> {
  const { data } = await supabase
    .from('user_ratings')
    .select('rating')
    .eq('movie_id', movieId)

  const histogram: Record<number, number> = {}
  for (let i = 1; i <= 10; i++) histogram[i] = 0
  data?.forEach(r => { histogram[r.rating] = (histogram[r.rating] || 0) + 1 })
  return histogram
}
