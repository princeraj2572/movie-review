import { supabase } from './supabase';

export interface Achievement {
  id: string;
  badge_name: string;
  description: string;
  icon_emoji: string;
  threshold: number;
  achievement_type: 'reviews' | 'rating_count' | 'followers' | 'helpful_votes';
  created_at: string;
}

export interface UserAchievement extends Achievement {
  unlocked_at: string;
}

// Get all available achievements
export async function getAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('threshold', { ascending: true });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data || [];
}

// Get user's unlocked achievements
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (
        id,
        badge_name,
        description,
        icon_emoji,
        threshold,
        achievement_type
      )
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }

  return data?.map((item: any) => ({
    ...item.achievements,
    unlocked_at: item.unlocked_at,
  })) || [];
}

// Check and unlock achievements for a user
export async function checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
  // Get all achievements
  const allAchievements = await getAllAchievements();

  // Get user's profile data for stats
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('helpful_score')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return [];
  }

  // Count user's reviews
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('author_name', userId);

  // Count user's ratings
  const { count: ratingCount } = await supabase
    .from('user_ratings')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', userId);

  // Get follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId);

  const helpfulVotes = profile?.helpful_score || 0;

  const stats = {
    reviews: reviewCount || 0,
    rating_count: ratingCount || 0,
    followers: followerCount || 0,
    helpful_votes: helpfulVotes,
  };

  // Get already unlocked achievements
  const { data: unlockedData } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = new Set(unlockedData?.map((u: any) => u.achievement_id) || []);

  // Find new achievements to unlock
  const newAchievements: any[] = [];

  for (const achievement of allAchievements) {
    if (!unlockedIds.has(achievement.id)) {
      const userStat = stats[achievement.achievement_type as keyof typeof stats];

      if (userStat >= achievement.threshold) {
        newAchievements.push({
          user_id: userId,
          achievement_id: achievement.id,
        });
      }
    }
  }

  // Insert new achievements
  if (newAchievements.length > 0) {
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert(newAchievements);

    if (insertError) {
      console.error('Error unlocking achievements:', insertError);
    }
  }

  // Return all user's achievements
  return getUserAchievements(userId);
}

// Get achievement progress for a user
export async function getAchievementProgress(userId: string): Promise<any[]> {
  const allAchievements = await getAllAchievements();
  const userAchievements = await getUserAchievements(userId);

  // Get user stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('helpful_score')
    .eq('id', userId)
    .single();

  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('author_name', userId);

  const { count: followerCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId);

  const stats = {
    reviews: reviewCount || 0,
    rating_count: 0,
    followers: followerCount || 0,
    helpful_votes: profile?.helpful_score || 0,
  };

  const unlockedIds = new Set(userAchievements.map((a) => a.id));

  return allAchievements.map((achievement) => ({
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
}

// Increment helpful score for a user
export async function incrementHelpfulScore(userId: string, amount: number = 1): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('helpful_score')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return false;
  }

  const newScore = (data?.helpful_score || 0) + amount;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ helpful_score: newScore })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating helpful score:', updateError);
    return false;
  }

  // Check for new achievements
  await checkAndUnlockAchievements(userId);

  return true;
}
