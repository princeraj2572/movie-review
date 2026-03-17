'use client';

import { useEffect, useState } from 'react';
import { getUserAchievements, getAchievementProgress } from '@/lib/achievements';

interface AchievementsBadgesProps {
  userId: string;
  showTitle?: boolean;
  maxDisplay?: number;
}

export default function AchievementsBadges({
  userId,
  showTitle = true,
  maxDisplay = 8,
}: AchievementsBadgesProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    setLoading(true);
    const userAchievements = await getUserAchievements(userId);
    const achievementProgress = await getAchievementProgress(userId);
    setAchievements(userAchievements);
    setProgress(achievementProgress);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-zinc-400 text-sm">Loading achievements...</div>;
  }

  const unlockedAchievements = progress.filter((a) => a.unlocked);
  const inProgressAchievements = progress.filter((a) => !a.unlocked && a.progress > 0);

  const displayUnlocked = showAll ? unlockedAchievements : unlockedAchievements.slice(0, maxDisplay);
  const displayProgress = showAll
    ? inProgressAchievements
    : inProgressAchievements.slice(0, maxDisplay - displayUnlocked.length);

  return (
    <div className="w-full">
      {showTitle && <h3 className="text-lg font-bold text-amber-400 mb-3">Achievements</h3>}

      {unlockedAchievements.length === 0 && inProgressAchievements.length === 0 ? (
        <p className="text-zinc-500 text-sm">No achievements yet. Start reviewing movies!</p>
      ) : (
        <>
          {/* Unlocked Achievements */}
          {displayUnlocked.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase mb-2">Unlocked</h4>
              <div className="flex flex-wrap gap-2">
                {displayUnlocked.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="group relative"
                    title={`${achievement.badge_name}: ${achievement.description}`}
                  >
                    <div className="text-3xl cursor-help hover:scale-110 transition">
                      {achievement.icon_emoji}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap hidden group-hover:block bg-zinc-900 border border-amber-600 rounded px-2 py-1 text-xs text-white z-10">
                      <p className="font-semibold text-amber-400">{achievement.badge_name}</p>
                      <p className="text-zinc-300">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Achievements */}
          {displayProgress.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase mb-2">In Progress</h4>
              <div className="space-y-2">
                {displayProgress.map((achievement) => (
                  <div key={achievement.id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-300 flex items-center gap-2">
                        <span className="opacity-50">{achievement.icon_emoji}</span>
                        {achievement.badge_name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {achievement.current}/{achievement.threshold}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show All Button */}
          {(unlockedAchievements.length > maxDisplay ||
            inProgressAchievements.length + unlockedAchievements.length > maxDisplay) &&
            !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold mt-2"
              >
                View all ({unlockedAchievements.length + inProgressAchievements.length})
              </button>
            )}
        </>
      )}
    </div>
  );
}
