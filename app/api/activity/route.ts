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
      case 'create':
        return await handleCreateActivity(data);
      case 'getFeed':
        return await handleGetActivityFeed(data);
      case 'getUserActivity':
        return await handleGetUserActivity(data);
      case 'getByType':
        return await handleGetByType(data);
      case 'getMovieActivity':
        return await handleGetMovieActivity(data);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCreateActivity(data: any) {
  const { user_id, activity_type, movie_id, review_id, related_user_id, description } = data;

  const { data: activity, error } = await supabase
    .from('activity')
    .insert([
      {
        user_id,
        activity_type,
        movie_id: movie_id || null,
        review_id: review_id || null,
        related_user_id: related_user_id || null,
        description: description || null,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(activity);
}

async function handleGetActivityFeed(data: any) {
  const { user_id, limit = 20 } = data;

  // Get following list
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user_id);

  if (!follows || follows.length === 0) {
    return NextResponse.json([]);
  }

  const followingIds = follows.map((f: any) => f.following_id);

  const { data: activity, error } = await supabase
    .from('activity')
    .select(
      `
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(activity || []);
}

async function handleGetUserActivity(data: any) {
  const { user_id, limit = 20 } = data;

  const { data: activity, error } = await supabase
    .from('activity')
    .select(
      `
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(activity || []);
}

async function handleGetByType(data: any) {
  const { activity_type, limit = 20 } = data;

  const { data: activity, error } = await supabase
    .from('activity')
    .select(
      `
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq('activity_type', activity_type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(activity || []);
}

async function handleGetMovieActivity(data: any) {
  const { movie_id, limit = 20 } = data;

  const { data: activity, error } = await supabase
    .from('activity')
    .select(
      `
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq('movie_id', movie_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(activity || []);
}
