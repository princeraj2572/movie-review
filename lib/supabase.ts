import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  reviews: {
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
  }
  user_ratings: {
    id: string
    movie_id: number
    session_id: string
    rating: number
    created_at: string
  }
  helpful_votes: {
    id: string
    review_id: string
    session_id: string
    vote: 'up' | 'down'
    created_at: string
  }
}
