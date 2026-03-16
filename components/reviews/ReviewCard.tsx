"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { voteHelpful, type Review } from "@/lib/reviews"
import CommentsSection from "@/components/comments/CommentsSection"

interface ReviewCardProps {
  review: Review
  onVote: (reviewId: string, vote: 'up' | 'down') => void
}

export default function ReviewCard({ review, onVote }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [spoilerRevealed, setSpoilerRevealed] = useState(false)
  const [voting, setVoting] = useState(false)
  const [localReview, setLocalReview] = useState(review)

  const isLong = review.body.length > 400

  async function handleVote(vote: 'up' | 'down') {
    if (voting) return
    setVoting(true)
    await voteHelpful(review.id, vote)
    setLocalReview(prev => {
      const wasUp = prev.user_vote === 'up'
      const wasDown = prev.user_vote === 'down'
      if (vote === 'up') {
        return { ...prev, helpful: wasUp ? prev.helpful - 1 : prev.helpful + 1, not_helpful: wasDown ? prev.not_helpful - 1 : prev.not_helpful, user_vote: wasUp ? null : 'up' }
      } else {
        return { ...prev, not_helpful: wasDown ? prev.not_helpful - 1 : prev.not_helpful + 1, helpful: wasUp ? prev.helpful - 1 : prev.helpful, user_vote: wasDown ? null : 'down' }
      }
    })
    onVote(review.id, vote)
    setVoting(false)
  }

  const avatarColors = ['#c9a84c', '#e53030', '#3b82f6', '#22c55e', '#a855f7', '#f97316']
  const avatarColor = avatarColors[review.author_name.charCodeAt(0) % avatarColors.length]
  const initials = review.author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const date = new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="border border-[#1e1e1e] bg-[#0f0f0f] p-5 rounded-sm hover:border-[#2a2a2a] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-black text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#e8e8e8] text-sm font-semibold">{review.author_name}</span>
              {review.is_critic && (
                <span className="bg-[#c9a84c]/20 text-[#c9a84c] text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-[#c9a84c]/30">Critic</span>
              )}
            </div>
            <p className="text-[#4b5563] text-xs">{date}</p>
          </div>
        </div>

        {/* Community rating badge — not TMDB */}
        <div className="flex items-center gap-1 bg-[#141414] border border-[#1e1e1e] px-2.5 py-1 rounded-sm flex-shrink-0">
          <Star className="w-3 h-3 text-[#c9a84c] fill-current" />
          <span className="text-[#c9a84c] text-sm font-bold">{review.rating}</span>
          <span className="text-[#374151] text-xs">/10</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-display text-[#e8e8e8] font-semibold mb-2">{review.title}</h4>

      {/* Body */}
      {review.is_spoiler && !spoilerRevealed ? (
        <div className="flex items-center gap-2 bg-[#1e1e1e] p-3 rounded-sm mb-3">
          <AlertTriangle className="w-4 h-4 text-[#f97316] flex-shrink-0" />
          <span className="text-[#9ca3af] text-sm">This review contains spoilers.</span>
          <button onClick={() => setSpoilerRevealed(true)} className="text-[#c9a84c] text-sm hover:underline ml-auto">Reveal</button>
        </div>
      ) : (
        <div>
          <p className={`text-[#9ca3af] text-sm leading-relaxed ${!expanded && isLong ? "line-clamp-4" : ""}`}>
            {review.body}
          </p>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[#c9a84c] text-xs mt-2 hover:underline">
              {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
            </button>
          )}
        </div>
      )}

      {/* Helpful votes */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#1e1e1e]">
        <span className="text-[#4b5563] text-xs">Was this helpful?</span>
        <button onClick={() => handleVote('up')} disabled={voting}
          className={`flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded-sm border ${localReview.user_vote === 'up' ? 'border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]' : 'border-[#1e1e1e] text-[#6b7280] hover:text-[#22c55e] hover:border-[#22c55e]/30'}`}>
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Yes ({localReview.helpful})</span>
        </button>
        <button onClick={() => handleVote('down')} disabled={voting}
          className={`flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded-sm border ${localReview.user_vote === 'down' ? 'border-[#e53030]/40 bg-[#e53030]/10 text-[#e53030]' : 'border-[#1e1e1e] text-[#6b7280] hover:text-[#e53030] hover:border-[#e53030]/30'}`}>
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>No ({localReview.not_helpful})</span>
        </button>
      </div>

      {/* Comments */}
      <CommentsSection reviewId={review.id} />
    </div>
  )
}
