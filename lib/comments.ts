import { supabase } from './supabase'

export interface Comment {
  id: string
  review_id: string
  user_id: string
  author_name: string
  body: string
  created_at: string
}

// Get all comments for a review
export async function getComments(reviewId: string): Promise<Comment[]> {
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true })
  return data || []
}

// Add a comment
export async function addComment(
  reviewId: string,
  userId: string,
  authorName: string,
  body: string
): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ review_id: reviewId, user_id: userId, author_name: authorName, body }])
    .select()
    .single()
  if (error) return null
  return data
}

// Delete a comment (own only)
export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)
  return !error
}

// Get comment count per review
export async function getCommentCount(reviewId: string): Promise<number> {
  const { count } = await supabase
    .from('comments')
    .select('id', { count: 'exact' })
    .eq('review_id', reviewId)
  return count || 0
}
