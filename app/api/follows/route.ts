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
      case 'follow':
        return await handleFollow(data);
      case 'unfollow':
        return await handleUnfollow(data);
      case 'getFollowers':
        return await handleGetFollowers(data);
      case 'getFollowing':
        return await handleGetFollowing(data);
      case 'getStats':
        return await handleGetStats(data);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Follows API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleFollow(data: any) {
  const { follower_id, following_id } = data;

  const { data: follow, error } = await supabase
    .from('follows')
    .insert([{ follower_id, following_id }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create activity record
  await supabase.from('activity').insert([
    {
      user_id: follower_id,
      activity_type: 'follow',
      related_user_id: following_id,
      description: 'started following',
    },
  ]);

  return NextResponse.json(follow);
}

async function handleUnfollow(data: any) {
  const { follower_id, following_id } = data;
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', follower_id)
    .eq('following_id', following_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

async function handleGetFollowers(data: any) {
  const { user_id } = data;

  const { data: followers, error } = await supabase
    .from('follows')
    .select(
      `
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
    `
    )
    .eq('following_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const result = followers?.map((item: any) => ({
    ...item.profiles,
    followed_at: item.created_at,
  })) || [];

  return NextResponse.json(result);
}

async function handleGetFollowing(data: any) {
  const { user_id } = data;

  const { data: following, error } = await supabase
    .from('follows')
    .select(
      `
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
    `
    )
    .eq('follower_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const result = following?.map((item: any) => ({
    ...item.profiles,
    followed_at: item.created_at,
  })) || [];

  return NextResponse.json(result);
}

async function handleGetStats(data: any) {
  const { user_id } = data;

  const { count: followersCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', user_id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', user_id);

  return NextResponse.json({
    followers: followersCount || 0,
    following: followingCount || 0,
  });
}
