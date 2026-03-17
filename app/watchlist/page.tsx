"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bookmark, Eye, Check, Trash2, Film, Lock } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getWatchlist, removeFromWatchlist, upsertWatchlist, type WatchlistItem, type WatchStatus } from "@/lib/watchlist"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const TABS: { key: WatchStatus | "all"; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <Bookmark className="w-4 h-4" /> },
  { key: "want", label: "Want to Watch", icon: <Bookmark className="w-4 h-4" /> },
  { key: "watching", label: "Watching", icon: <Eye className="w-4 h-4" /> },
  { key: "watched", label: "Watched", icon: <Check className="w-4 h-4" /> },
]

const STATUS_COLORS: Record<WatchStatus, string> = {
  want: "text-[#c9a84c] border-[#c9a84c]/30 bg-[#c9a84c]/10",
  watching: "text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/10",
  watched: "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10",
}

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<WatchStatus | "all">("all")

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getWatchlist(user.id).then(data => { setItems(data); setLoading(false) })
  }, [user])

  async function handleRemove(item: WatchlistItem) {
    if (!user) return
    await removeFromWatchlist(user.id, item.movie_id)
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  async function handleStatusChange(item: WatchlistItem, status: WatchStatus) {
    if (!user) return
    await upsertWatchlist(user.id, item.movie_id, item.movie_title, item.movie_poster, status)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status } : i))
  }

  const filtered = activeTab === "all" ? items : items.filter(i => i.status === activeTab)
  const counts = { all: items.length, want: items.filter(i => i.status === "want").length, watching: items.filter(i => i.status === "watching").length, watched: items.filter(i => i.status === "watched").length }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-20">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-10 bg-[#c9a84c]" />
            <div>
              <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-1">My List</p>
              <h1 className="font-display text-3xl font-bold text-[#e8e8e8]">Watchlist</h1>
            </div>
          </div>

          {!user && !authLoading ? (
            <div className="text-center py-24 border border-dashed border-[#1e1e1e] rounded-sm">
              <Lock className="w-12 h-12 text-[#374151] mx-auto mb-4" />
              <p className="font-display text-xl text-[#6b7280] mb-2">Sign in to see your watchlist</p>
              <p className="text-[#4b5563] text-sm">Create an account to save movies and track what you watch</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 flex-wrap mb-8 border-b border-[#1e1e1e] pb-0">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-widest font-semibold border-b-2 -mb-px transition-colors ${
                      activeTab === tab.key
                        ? "border-[#c9a84c] text-[#c9a84c]"
                        : "border-transparent text-[#6b7280] hover:text-[#9ca3af]"
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? "bg-[#c9a84c]/20 text-[#c9a84c]" : "bg-[#1e1e1e] text-[#4b5563]"
                    }`}>
                      {counts[tab.key]}
                    </span>
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-[#141414] rounded-sm mb-2" />
                      <div className="h-3 bg-[#141414] rounded w-3/4 mb-1" />
                      <div className="h-2 bg-[#141414] rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#1e1e1e] rounded-sm">
                  <Film className="w-10 h-10 text-[#374151] mx-auto mb-3" />
                  <p className="text-[#6b7280] font-display text-lg">
                    {activeTab === "all" ? "Your watchlist is empty" : `No movies in "${TABS.find(t => t.key === activeTab)?.label}"`}
                  </p>
                  <Link href="/movies" className="text-[#c9a84c] text-sm mt-3 hover:underline inline-block">
                    Browse movies →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filtered.map(item => (
                    <div key={item.id} className="group relative">
                      <Link href={`/movie/${item.movie_id}`}>
                        <div className="relative aspect-[2/3] bg-[#141414] overflow-hidden rounded-sm mb-2">
                          {item.movie_poster ? (
                            <Image src={item.movie_poster} alt={item.movie_title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-8 h-8 text-[#374151]" />
                            </div>
                          )}
                          {/* Status badge */}
                          <div className={`absolute top-2 left-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 border rounded-sm font-semibold ${STATUS_COLORS[item.status]}`}>
                            {item.status}
                          </div>
                        </div>
                      </Link>
                      <p className="text-[#e8e8e8] text-xs font-medium line-clamp-2 leading-tight group-hover:text-[#c9a84c] transition-colors">
                        {item.movie_title}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-2">
                        {(["want", "watching", "watched"] as WatchStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(item, s)}
                            className={`flex-1 py-1 text-[9px] uppercase tracking-wider border transition-all rounded-sm ${
                              item.status === s
                                ? STATUS_COLORS[s]
                                : "border-[#1e1e1e] text-[#374151] hover:border-[#374151] hover:text-[#6b7280]"
                            }`}
                          >
                            {s === "want" ? "Want" : s === "watching" ? "Watching" : "Watched"}
                          </button>
                        ))}
                        <button
                          onClick={() => handleRemove(item)}
                          className="p-1 text-[#374151] hover:text-[#e53030] transition-colors border border-[#1e1e1e] hover:border-[#e53030]/30 rounded-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
