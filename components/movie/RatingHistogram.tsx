"use client"

import { useState, useEffect } from "react"
import { getRatingHistogram } from "@/lib/reviews"

interface RatingHistogramProps {
  movieId: number
}

export default function RatingHistogram({ movieId }: RatingHistogramProps) {
  const [histogram, setHistogram] = useState<Record<number, number>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getRatingHistogram(movieId).then(h => {
      setHistogram(h)
      setLoaded(true)
    })
  }, [movieId])

  const total = Object.values(histogram).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...Object.values(histogram), 1)
  const avg = total > 0
    ? (Object.entries(histogram).reduce((s, [r, c]) => s + Number(r) * c, 0) / total).toFixed(1)
    : null

  return (
    <div className="bg-[#141414] border border-[#1e1e1e] p-5 rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Community Rating</p>
          {avg ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#c9a84c] font-accent text-4xl">{avg}</span>
              <span className="text-[#4b5563] text-sm">/10</span>
            </div>
          ) : (
            <p className="text-[#4b5563] text-sm italic">No ratings yet</p>
          )}
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-[#e8e8e8] font-semibold text-lg">{total.toLocaleString()}</p>
            <p className="text-[#6b7280] text-xs">CineScope {total === 1 ? "rating" : "ratings"}</p>
          </div>
        )}
      </div>

      {loaded && total > 0 && (
        <div className="space-y-1.5 mt-4 border-t border-[#1e1e1e] pt-4">
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-3">Rating Distribution</p>
          {Array.from({ length: 10 }, (_, i) => 10 - i).map(rating => {
            const count = histogram[rating] || 0
            const percent = (count / maxCount) * 100
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-[#6b7280] text-xs w-4 text-right">{rating}</span>
                <div className="flex-1 h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${percent}%`,
                      background: rating >= 8 ? '#22c55e' : rating >= 6 ? '#c9a84c' : rating >= 4 ? '#f97316' : '#ef4444'
                    }}
                  />
                </div>
                <span className="text-[#4b5563] text-xs w-6">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {loaded && total === 0 && (
        <p className="text-[#4b5563] text-xs mt-3 border-t border-[#1e1e1e] pt-3">
          Be the first to rate this film
        </p>
      )}
    </div>
  )
}
