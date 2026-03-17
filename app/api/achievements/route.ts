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
      case 'getAllAchievements':
        return await handleGetAllAchievements();
      case 'getUserAchievements':
        return await handleGetUserAchievements(data);
      case 'checkUnlock':
        return await handleCheckUnlock(data);
      case 'getProgress':
        return await handleGetProgress(data);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGetAllAchievements() {
  const { data: achievements, error } = await supabase
    .from('achievements')
    .select('*')
    .order('threshold', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(achievements || []);
}

async function handleGetUserAchievements(data: any) {
  const { user_id } = data;

  const { data: userAchievements, error } = await supabase
    .from('user_achievements')
    .select(
      `
      *,
      achievements (
        id,
        badge_name,
        description,
        icon_emoji,
        threshold,
        achievement_type
      )
    `
    )
    .eq('user_id', user_id)
    .order('unlocked_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const result = userAchievements?.map((item: any) => ({
    ...item.achievements,
    unlocked_at: item.unlocked_at,
  })) || [];

  return NextResponse.json(result);
}

async function handleCheckUnlock(data: any) {
  const { user_id } = data;

  const allAchievements = await handleGetAllAchievements().then((res) => res.json());
  const userAchievements = await handleGetUserAchievements({ user_id }).then((res) => res.json());

  const { data: profile } = await supabase
    .from('profiles')
    .select('helpful_score')
    .eq('id', user_id)
    .single();

  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('author_name', user_id);

  const { count: followerCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', user_id);

  const stats = {
    reviews: reviewCount || 0,
    rating_count: 0,
    followers: followerCount || 0,
    helpful_votes: profile?.helpful_score || 0,
  };

  const unlockedIds = new Set(userAchievements.map((a: any) => a.id));
  const newAchievements: any[] = [];

  for (const achievement of allAchievements) {
    if (!unlockedIds.has(achievement.id)) {
      const userStat = stats[achievement.achievement_type as keyof typeof stats];
      if (userStat >= achievement.threshold) {
        newAchievements.push({
          user_id,
          achievement_id: achievement.id,
        });
      }
    }
  }

  if (newAchievements.length > 0) {
    const { error: insertError } = await supabase.from('user_achievements').insert(newAchievements);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  }

  const updated = await handleGetUserAchievements({ user_id }).then((res) => res.json());
  return NextResponse.json({ unlocked: newAchievements.length, achievements: updated });
}

async function handleGetProgress(data: any) {
  const { user_id } = data;

  const allAchievements = await handleGetAllAchievements().then((res) => res.json());
  const userAchievements = await handleGetUserAchievements({ user_id }).then((res) => res.json());

  const { data: profile } = await supabase
    .from('profiles')
    .select('helpful_score')
    .eq('id', user_id)
    .single();

  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('author_name', user_id);

  const { count: followerCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', user_id);

  const stats = {
    reviews: reviewCount || 0,
    rating_count: 0,
    followers: followerCount || 0,
    helpful_votes: profile?.helpful_score || 0,
  };

  const unlockedIds = new Set(userAchievements.map((a: any) => a.id));

  const progress = allAchievements.map((achievement: any) => ({
    ...achievement,
    unlocked: unlockedIds.has(achievement.id),
    progress: Math.min(
      100,
      Math.round(
        (stats[achievement.achievement_type as keyof typeof stats] / achievement.threshold) * 100
      )
    ),
    current: stats[achievement.achievement_type as keyof typeof stats],
  }));

  return NextResponse.json(progress);
}
