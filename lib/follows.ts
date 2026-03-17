import { supabase } from './supabase';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Check if user follows another user
export async function isFollowing(userId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking follow status:', error);
    return false;
  }

  return !!data;
}

// Follow a user
export async function followUser(userId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === userId) return false;

  const { error } = await supabase
    .from('follows')
    .insert([
      {
        follower_id: user.id,
        following_id: userId,
      },
    ]);

  if (error) {
    console.error('Error following user:', error);
    return false;
  }

  // Create activity record
  await supabase
    .from('activity')
    .insert([
      {
        user_id: user.id,
        activity_type: 'follow',
        related_user_id: userId,
        description: `started following`,
      },
    ]);

  return true;
}

// Unfollow a user
export async function unfollowUser(userId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId);

  if (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }

  return true;
}

// Get followers of a user
export async function getFollowers(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      follower_id,
      created_at,
      profiles:follower_id (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching followers:', error);
    return [];
  }

  return data?.map((item: any) => ({
    ...item.profiles,
    followed_at: item.created_at,
  })) || [];
}

// Get following of a user
export async function getFollowing(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      following_id,
      created_at,
      profiles:following_id (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching following:', error);
    return [];
  }

  return data?.map((item: any) => ({
    ...item.profiles,
    followed_at: item.created_at,
  })) || [];
}

// Get follower count
export async function getFollowerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) {
    console.error('Error fetching follower count:', error);
    return 0;
  }

  return count || 0;
}

// Get following count
export async function getFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) {
    console.error('Error fetching following count:', error);
    return 0;
  }

  return count || 0;
}
