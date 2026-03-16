"use client"

import { useState, useEffect } from "react"
import { Star, X } from "lucide-react"
import { getUserRating, saveUserRating, removeUserRating, getCommunityRating } from "@/lib/ratings"

interface UserRatingProps {
  movieId: number
  movieTitle: string
}

const RATING_LABELS: Record<number, string> = {
  1: "Awful", 2: "Terrible", 3: "Bad", 4: "Poor",
  5: "Average", 6: "Fine", 7: "Good", 8: "Great",
  9: "Excellent", 10: "Masterpiece"
}

export default function UserRating({ movieId, movieTitle }: UserRatingProps) {
  const [hovered, setHovered] = useState(0)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [community, setCommunity] = useState<{ average: number; count: number }>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [ur, cr] = await Promise.all([
        getUserRating(movieId),
        getCommunityRating(movieId)
      ])
      setUserRating(ur)
      setCommunity(cr)
      setLoading(false)
    }
    load()
  }, [movieId])

  async function handleRate(rating: number) {
    if (saving) return
    setSaving(true)
    const ok = await saveUserRating(movieId, rating)
    if (ok) {
      setUserRating(rating)
      // Refresh community rating
      const cr = await getCommunityRating(movieId)
      setCommunity(cr)
    }
    setSaving(false)
  }

  async function handleRemove() {
    if (saving) return
    setSaving(true)
    await removeUserRating(movieId)
    setUserRating(null)
    const cr = await getCommunityRating(movieId)
    setCommunity(cr)
    setSaving(false)
  }

  const displayRating = hovered || userRating || 0

  return (
    <div className="bg-[#141414] border border-[#1e1e1e] p-5 rounded-sm">
      <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Rate This Movie</p>
      <p className="text-[#e8e8e8] font-display text-lg font-semibold mb-4">{movieTitle}</p>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-3" onMouseLeave={() => setHovered(0)}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(star => (
          <button
            key={star}
            disabled={saving || loading}
            onMouseEnter={() => setHovered(star)}
            onClick={() => handleRate(star)}
            className="transition-transform duration-100 hover:scale-125 disabled:cursor-not-allowed"
          >
            <Star
              className={`w-6 h-6 transition-colors duration-100 ${
                star <= displayRating
                  ? "text-[#c9a84c] fill-current"
                  : "text-[#374151]"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Label */}
      <div className="h-5 mb-4">
        {hovered > 0 && (
          <p className="text-[#c9a84c] text-sm font-semibold">
            {hovered}/10 — {RATING_LABELS[hovered]}
          </p>
        )}
        {hovered === 0 && userRating && (
          <p className="text-[#22c55e] text-sm font-semibold flex items-center gap-2">
            Your rating: {userRating}/10 — {RATING_LABELS[userRating]}
            <button
              onClick={handleRemove}
              className="text-[#6b7280] hover:text-[#e53030] transition-colors"
              title="Remove rating"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </p>
        )}
        {hovered === 0 && !userRating && !loading && (
          <p className="text-[#4b5563] text-sm">Click a star to rate</p>
        )}
      </div>

      {/* Community rating */}
      <div className="border-t border-[#1e1e1e] pt-4">
        <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Community Rating</p>
        {community.count > 0 ? (
          <div className="flex items-baseline gap-2">
            <span className="text-[#c9a84c] font-accent text-3xl">{community.average.toFixed(1)}</span>
            <span className="text-[#4b5563] text-sm">/ 10</span>
            <span className="text-[#6b7280] text-xs ml-1">({community.count.toLocaleString()} {community.count === 1 ? "rating" : "ratings"})</span>
          </div>
        ) : (
          <p className="text-[#4b5563] text-sm">No ratings yet — be the first!</p>
        )}
      </div>
    </div>
  )
}
