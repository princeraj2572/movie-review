"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Trash2, Send, ChevronDown, ChevronUp } from "lucide-react"
import { getComments, addComment, deleteComment, type Comment } from "@/lib/comments"
import { useAuth } from "@/components/auth/AuthProvider"

interface CommentsSectionProps {
  reviewId: string
  initialCount?: number
}

export default function CommentsSection({ reviewId, initialCount = 0 }: CommentsSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [authPrompt, setAuthPrompt] = useState(false)
  const [count, setCount] = useState(initialCount)

  async function load() {
    setLoading(true)
    const data = await getComments(reviewId)
    setComments(data)
    setCount(data.length)
    setLoading(false)
  }

  function handleToggle() {
    if (!expanded && comments.length === 0) load()
    setExpanded(!expanded)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { setAuthPrompt(true); setTimeout(() => setAuthPrompt(false), 3000); return }
    if (!body.trim()) return
    setSubmitting(true)
    const comment = await addComment(reviewId, user.id, user.full_name || user.username, body.trim())
    if (comment) {
      setComments(prev => [...prev, comment])
      setCount(c => c + 1)
      setBody("")
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    if (!user) return
    await deleteComment(commentId, user.id)
    setComments(prev => prev.filter(c => c.id !== commentId))
    setCount(c => c - 1)
  }

  const avatarColors = ["#c9a84c", "#3b82f6", "#22c55e", "#a855f7", "#e53030"]

  return (
    <div className="mt-4 border-t border-[#1e1e1e] pt-3">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-[#6b7280] hover:text-[#9ca3af] transition-colors text-xs"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>{count} {count === 1 ? "comment" : "comments"}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Comment list */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1e1e1e] flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-[#1e1e1e] rounded w-24" />
                    <div className="h-3 bg-[#1e1e1e] rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-[#4b5563] text-xs italic">No comments yet. Be the first!</p>
          ) : (
            comments.map(comment => {
              const color = avatarColors[(comment.author_name?.charCodeAt(0) || 0) % avatarColors.length]
              const initials = comment.author_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
              const isOwn = user?.id === comment.user_id
              const date = new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

              return (
                <div key={comment.id} className="flex gap-2.5 group">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-black text-[9px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#e8e8e8] text-xs font-semibold">{comment.author_name}</span>
                      <span className="text-[#374151] text-[10px]">{date}</span>
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-[#374151] hover:text-[#e53030] transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[#9ca3af] text-xs leading-relaxed mt-0.5">{comment.body}</p>
                  </div>
                </div>
              )
            })
          )}

          {/* Add comment form */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-3 pt-3 border-t border-[#1e1e1e]">
            {user ? (
              <>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-black text-[9px] font-bold flex-shrink-0"
                  style={{ background: avatarColors[(user.username?.charCodeAt(0) || 0) % avatarColors.length] }}
                >
                  {(user.full_name || user.username || "U")[0].toUpperCase()}
                </div>
                <input
                  type="text"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write a comment..."
                  maxLength={500}
                  className="flex-1 bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/40 text-[#e8e8e8] px-3 py-1.5 text-xs outline-none rounded-sm placeholder-[#374151]"
                />
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="text-[#c9a84c] hover:text-[#f0c060] disabled:text-[#374151] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setAuthPrompt(!authPrompt)}
                  className="text-[#4b5563] text-xs hover:text-[#c9a84c] transition-colors"
                >
                  Sign in to comment
                </button>
                {authPrompt && (
                  <div className="absolute bottom-full mb-1 left-0 bg-[#141414] border border-[#1e1e1e] text-[#e8e8e8] text-xs px-3 py-2 rounded-sm whitespace-nowrap z-10">
                    Please sign in to leave a comment
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
