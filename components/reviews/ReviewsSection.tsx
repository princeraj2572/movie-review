"use client"

import { useState, useEffect } from "react"
import { PenSquare, SortAsc, Filter, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReviewCard from "./ReviewCard"
import WriteReviewForm from "./WriteReviewForm"
import { getReviews, type Review } from "@/lib/reviews"

interface ReviewsSectionProps {
  movieId: number
  movieTitle: string
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful'
type FilterOption = 'all' | 'critics' | 'users'

export default function ReviewsSection({ movieId, movieTitle }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sort, setSort] = useState<SortOption>('newest')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [hideSpoilers, setHideSpoilers] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [movieId])

  async function loadReviews() {
    setLoading(true)
    const data = await getReviews(movieId)
    setReviews(data)
    setLoading(false)
  }

  function handleNewReview(review: Review) {
    setReviews(prev => [review, ...prev])
    setShowForm(false)
  }

  function handleVote(reviewId: string, vote: 'up' | 'down') {
    // Reviews will reflect vote via ReviewCard's internal state
  }

  // Filter
  let filtered = reviews.filter(r => {
    if (filter === 'critics') return r.is_critic
    if (filter === 'users') return !r.is_critic
    return true
  })

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sort === 'highest') return b.rating - a.rating
    if (sort === 'lowest') return a.rating - b.rating
    if (sort === 'most_helpful') return b.helpful - a.helpful
    return 0
  })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div id="reviews">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-[#c9a84c]" />
            <span className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">User Reviews</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-bold text-[#e8e8e8]">Reviews & Ratings</h2>
            {reviews.length > 0 && (
              <span className="text-[#6b7280] text-sm">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                {avgRating && <span className="text-[#c9a84c] ml-2">· avg {avgRating}/10</span>}
              </span>
            )}
          </div>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 hidden sm:flex">
            <PenSquare className="w-4 h-4" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Write form */}
      {showForm && (
        <div className="mb-8">
          <WriteReviewForm
            movieId={movieId}
            movieTitle={movieTitle}
            onSubmitted={handleNewReview}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Mobile write button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-2 w-full sm:hidden mb-6">
          <PenSquare className="w-4 h-4" />
          Write a Review
        </Button>
      )}

      {/* Controls */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-6 pb-6 border-b border-[#1e1e1e]">
          {/* Filter */}
          <div className="flex items-center gap-1 text-[#6b7280]">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider">Filter:</span>
          </div>
          {(['all', 'users', 'critics'] as FilterOption[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition-all ${
                filter === f
                  ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]'
                  : 'border-[#1e1e1e] text-[#6b7280] hover:border-[#374151] hover:text-[#9ca3af]'
              }`}
            >
              {f === 'all' ? `All (${reviews.length})` : f === 'critics' ? `Critics (${reviews.filter(r => r.is_critic).length})` : `Users (${reviews.filter(r => !r.is_critic).length})`}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1 text-[#6b7280]">
            <SortAsc className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider">Sort:</span>
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="bg-[#141414] border border-[#1e1e1e] text-[#9ca3af] text-xs px-3 py-1.5 outline-none focus:border-[#c9a84c]/50 rounded-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="most_helpful">Most Helpful</option>
          </select>

          {/* Spoiler toggle */}
          <label className="flex items-center gap-2 cursor-pointer ml-2">
            <div
              onClick={() => setHideSpoilers(!hideSpoilers)}
              className={`w-8 h-4 rounded-full transition-colors relative ${hideSpoilers ? 'bg-[#c9a84c]' : 'bg-[#1e1e1e]'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${hideSpoilers ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[#6b7280] text-xs">Hide spoilers</span>
          </label>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-[#1e1e1e] bg-[#0f0f0f] p-5 rounded-sm animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#1e1e1e]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#1e1e1e] rounded w-32" />
                  <div className="h-2 bg-[#1e1e1e] rounded w-20" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-[#1e1e1e] rounded w-48" />
                <div className="h-3 bg-[#1e1e1e] rounded w-full" />
                <div className="h-3 bg-[#1e1e1e] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#1e1e1e] rounded-sm">
          <MessageSquare className="w-10 h-10 text-[#374151] mx-auto mb-3" />
          <p className="text-[#6b7280] font-display text-lg">
            {reviews.length === 0 ? "No reviews yet" : "No reviews match your filter"}
          </p>
          <p className="text-[#4b5563] text-sm mt-1">
            {reviews.length === 0 ? "Be the first to review this film" : "Try a different filter"}
          </p>
          {reviews.length === 0 && !showForm && (
            <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
              <PenSquare className="w-4 h-4" />
              Write First Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <ReviewCard
              key={review.id}
              review={hideSpoilers ? review : { ...review, is_spoiler: false }}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  )
}
