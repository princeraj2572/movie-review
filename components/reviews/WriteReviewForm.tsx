"use client"

import { useState } from "react"
import { Star, AlertTriangle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addReview, type Review } from "@/lib/reviews"

interface WriteReviewFormProps {
  movieId: number
  movieTitle: string
  onSubmitted: (review: Review) => void
  onCancel: () => void
}

export default function WriteReviewForm({ movieId, movieTitle, onSubmitted, onCancel }: WriteReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [authorName, setAuthorName] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const RATING_LABELS: Record<number, string> = {
    1: "Awful", 2: "Terrible", 3: "Bad", 4: "Poor",
    5: "Average", 6: "Fine", 7: "Good", 8: "Great",
    9: "Excellent", 10: "Masterpiece"
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!authorName.trim()) errs.authorName = "Please enter your name"
    if (!rating) errs.rating = "Please select a rating"
    if (!title.trim()) errs.title = "Please enter a review title"
    if (body.trim().length < 30) errs.body = "Review must be at least 30 characters"
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    const review = await addReview({
      movie_id: movieId,
      author_name: authorName.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
      is_spoiler: isSpoiler
    })
    setSubmitting(false)
    if (review) {
      onSubmitted(review)
    } else {
      setErrors({ submit: "Failed to submit review. Please try again." })
    }
  }

  const displayRating = hovered || rating

  return (
    <div className="bg-[#0f0f0f] border border-[#c9a84c]/30 rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-[#e8e8e8] text-xl font-semibold">Write a Review</h3>
          <p className="text-[#6b7280] text-sm mt-0.5">{movieTitle}</p>
        </div>
        <button onClick={onCancel} className="text-[#6b7280] hover:text-[#e8e8e8] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Author name */}
        <div>
          <label className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold block mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={authorName}
            onChange={e => { setAuthorName(e.target.value); setErrors(p => ({ ...p, authorName: '' })) }}
            placeholder="Enter your name"
            className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] px-4 py-2.5 text-sm outline-none transition-colors placeholder-[#374151] rounded-sm"
          />
          {errors.authorName && <p className="text-[#e53030] text-xs mt-1">{errors.authorName}</p>}
        </div>

        {/* Star rating */}
        <div>
          <label className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold block mb-2">
            Your Rating *
          </label>
          <div className="flex items-center gap-1.5 mb-1" onMouseLeave={() => setHovered(0)}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onClick={() => { setRating(star); setErrors(p => ({ ...p, rating: '' })) }}
                className="transition-transform hover:scale-125"
              >
                <Star className={`w-7 h-7 transition-colors ${star <= displayRating ? "text-[#c9a84c] fill-current" : "text-[#374151]"}`} />
              </button>
            ))}
          </div>
          {displayRating > 0 && (
            <p className="text-[#c9a84c] text-sm">{displayRating}/10 — {RATING_LABELS[displayRating]}</p>
          )}
          {errors.rating && <p className="text-[#e53030] text-xs mt-1">{errors.rating}</p>}
        </div>

        {/* Review title */}
        <div>
          <label className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold block mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })) }}
            placeholder="Summarize your review in one line"
            maxLength={100}
            className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] px-4 py-2.5 text-sm outline-none transition-colors placeholder-[#374151] rounded-sm"
          />
          {errors.title && <p className="text-[#e53030] text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Review body */}
        <div>
          <label className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold block mb-2">
            Your Review *
          </label>
          <textarea
            value={body}
            onChange={e => { setBody(e.target.value); setErrors(p => ({ ...p, body: '' })) }}
            placeholder="Share your detailed thoughts about this film..."
            rows={6}
            className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] px-4 py-2.5 text-sm outline-none transition-colors placeholder-[#374151] resize-none rounded-sm"
          />
          <div className="flex justify-between mt-1">
            {errors.body ? (
              <p className="text-[#e53030] text-xs">{errors.body}</p>
            ) : (
              <p className="text-[#4b5563] text-xs">{body.length} characters (min. 30)</p>
            )}
          </div>
        </div>

        {/* Spoiler toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setIsSpoiler(!isSpoiler)}
            className={`w-10 h-5 rounded-full transition-colors relative ${isSpoiler ? 'bg-[#f97316]' : 'bg-[#1e1e1e]'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isSpoiler ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-3.5 h-3.5 ${isSpoiler ? 'text-[#f97316]' : 'text-[#4b5563]'}`} />
            <span className="text-sm text-[#9ca3af] group-hover:text-[#e8e8e8] transition-colors">
              This review contains spoilers
            </span>
          </div>
        </label>

        {errors.submit && (
          <p className="text-[#e53030] text-sm bg-[#e53030]/10 border border-[#e53030]/20 px-3 py-2 rounded-sm">
            {errors.submit}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
