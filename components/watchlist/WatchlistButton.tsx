"use client"

import { useState, useEffect } from "react"
import { Bookmark, BookmarkCheck, Eye, Clock, Check, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getMovieWatchStatus, upsertWatchlist, removeFromWatchlist, type WatchStatus } from "@/lib/watchlist"

interface WatchlistButtonProps {
  movieId: number
  movieTitle: string
  moviePoster: string
  variant?: "icon" | "full"
}

const STATUS_CONFIG: Record<WatchStatus, { label: string; icon: React.ReactNode; color: string }> = {
  want: { label: "Want to Watch", icon: <Bookmark className="w-4 h-4" />, color: "text-[#c9a84c]" },
  watching: { label: "Watching", icon: <Eye className="w-4 h-4" />, color: "text-[#3b82f6]" },
  watched: { label: "Watched", icon: <Check className="w-4 h-4" />, color: "text-[#22c55e]" },
}

export default function WatchlistButton({ movieId, movieTitle, moviePoster, variant = "icon" }: WatchlistButtonProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<WatchStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [authPrompt, setAuthPrompt] = useState(false)

  useEffect(() => {
    if (!user) return
    getMovieWatchStatus(user.id, movieId).then(setStatus)
  }, [user, movieId])

  async function handleSelect(newStatus: WatchStatus) {
    if (!user) { setAuthPrompt(true); setTimeout(() => setAuthPrompt(false), 3000); return }
    setLoading(true)
    setShowMenu(false)
    if (status === newStatus) {
      await removeFromWatchlist(user.id, movieId)
      setStatus(null)
    } else {
      await upsertWatchlist(user.id, movieId, movieTitle, moviePoster, newStatus)
      setStatus(newStatus)
    }
    setLoading(false)
  }

  if (variant === "icon") {
    return (
      <div className="relative">
        <button
          onClick={() => {
            if (!user) { setAuthPrompt(true); setTimeout(() => setAuthPrompt(false), 2000); return }
            setShowMenu(!showMenu)
          }}
          disabled={loading}
          className={`transition-colors ${status ? STATUS_CONFIG[status].color : "text-[#374151] hover:text-[#c9a84c]"}`}
          title={status ? STATUS_CONFIG[status].label : "Add to Watchlist"}
        >
          {status === "watched" ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        {authPrompt && (
          <div className="absolute bottom-full mb-2 right-0 bg-[#141414] border border-[#1e1e1e] text-[#e8e8e8] text-xs px-3 py-2 rounded-sm whitespace-nowrap z-50">
            Sign in to use watchlist
          </div>
        )}
        {showMenu && (
          <div className="absolute bottom-full mb-2 right-0 bg-[#141414] border border-[#1e1e1e] rounded-sm shadow-xl z-50 overflow-hidden min-w-[160px]">
            {(Object.entries(STATUS_CONFIG) as [WatchStatus, typeof STATUS_CONFIG[WatchStatus]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs w-full text-left transition-colors hover:bg-[#1e1e1e] ${
                  status === key ? cfg.color : "text-[#9ca3af]"
                }`}
              >
                {cfg.icon}
                {cfg.label}
                {status === key && <span className="ml-auto text-[#4b5563]">✓</span>}
              </button>
            ))}
            {status && (
              <button
                onClick={() => handleSelect(status)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs w-full text-left text-[#e53030] hover:bg-[#1e1e1e] border-t border-[#1e1e1e]"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Full variant for movie detail page
  return (
    <div className="relative">
      <button
        onClick={() => {
          if (!user) { setAuthPrompt(true); setTimeout(() => setAuthPrompt(false), 2000); return }
          setShowMenu(!showMenu)
        }}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 border text-sm font-medium transition-all rounded-sm ${
          status
            ? `border-current ${STATUS_CONFIG[status].color} bg-current/10`
            : "border-[#1e1e1e] text-[#9ca3af] hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
        }`}
      >
        {status ? STATUS_CONFIG[status].icon : <Bookmark className="w-4 h-4" />}
        <span>{status ? STATUS_CONFIG[status].label : "Add to Watchlist"}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMenu ? "rotate-180" : ""}`} />
      </button>

      {authPrompt && (
        <div className="absolute top-full mt-2 left-0 bg-[#141414] border border-[#1e1e1e] text-[#e8e8e8] text-xs px-3 py-2 rounded-sm whitespace-nowrap z-50">
          Sign in to use watchlist
        </div>
      )}

      {showMenu && (
        <div className="absolute top-full mt-1 left-0 bg-[#141414] border border-[#1e1e1e] rounded-sm shadow-xl z-50 overflow-hidden min-w-[180px]">
          {(Object.entries(STATUS_CONFIG) as [WatchStatus, typeof STATUS_CONFIG[WatchStatus]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-colors hover:bg-[#1e1e1e] ${
                status === key ? cfg.color : "text-[#9ca3af]"
              }`}
            >
              {cfg.icon}
              {cfg.label}
              {status === key && <span className="ml-auto">✓</span>}
            </button>
          ))}
          {status && (
            <button
              onClick={() => handleSelect(status)}
              className="flex items-center gap-2 px-4 py-3 text-sm w-full text-left text-[#e53030] hover:bg-[#1e1e1e] border-t border-[#1e1e1e]"
            >
              Remove from Watchlist
            </button>
          )}
        </div>
      )}
    </div>
  )
}
