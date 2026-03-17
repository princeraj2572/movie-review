import { supabase } from './supabase';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: 'review' | 'rating' | 'watchlist' | 'follow';
  movie_id?: number;
  review_id?: string;
  related_user_id?: string;
  description?: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

// Create activity record
export async function createActivity(
  activityType: 'review' | 'rating' | 'watchlist' | 'follow',
  movieId?: number,
  reviewId?: string,
  relatedUserId?: string,
  description?: string
): Promise<Activity | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('activity')
    .insert([
      {
        user_id: user.id,
        activity_type: activityType,
        movie_id: movieId || null,
        review_id: reviewId || null,
        related_user_id: relatedUserId || null,
        description: description || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    return null;
  }

  return data;
}

// Get activity feed for current user (from followed users)
export async function getActivityFeed(limit: number = 20): Promise<Activity[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get list of users the current user follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);

  if (!follows || follows.length === 0) return [];

  const followingIds = follows.map((f) => f.following_id);

  // Get activity from followed users
  const { data, error } = await supabase
    .from('activity')
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }

  return data || [];
}

// Get user's own activity
export async function getUserActivity(userId: string, limit: number = 20): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activity')
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }

  return data || [];
}

// Get activity by type
export async function getActivityByType(
  activityType: 'review' | 'rating' | 'watchlist' | 'follow',
  limit: number = 20
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activity')
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('activity_type', activityType)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity by type:', error);
    return [];
  }

  return data || [];
}

// Get activity for a specific movie
export async function getMovieActivity(movieId: number, limit: number = 20): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activity')
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching movie activity:', error);
    return [];
  }

  return data || [];
}
