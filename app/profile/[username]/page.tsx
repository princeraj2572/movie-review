"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Star, MessageSquare, Bookmark, Users, UserPlus, UserMinus, Film, Calendar } from "lucide-react"
import { getProfileByUsername, toggleFollow, isFollowing, getFollowCounts, type AuthUser } from "@/lib/auth"
import { getReviews, type Review } from "@/lib/reviews"
import { getWatchlistCounts } from "@/lib/watchlist"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { user: currentUser } = useAuth()

  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [watchCounts, setWatchCounts] = useState({ total: 0, watched: 0, want: 0, watching: 0 })
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"reviews" | "ratings" | "watchlist">("reviews")

  useEffect(() => {
    async function load() {
      const prof = await getProfileByUsername(username)
      if (!prof) { setLoading(false); return }
      setProfile(prof)
      const [revs, wc, fc] = await Promise.all([
        getReviews(0).then(() => []), // placeholder - in real app fetch by user
        getWatchlistCounts(prof.id),
        getFollowCounts(prof.id),
      ])
      setWatchCounts(wc)
      setFollowCounts(fc)
      if (currentUser && currentUser.id !== prof.id) {
        const f = await isFollowing(currentUser.id, prof.id)
        setFollowing(f)
      }
      setLoading(false)
    }
    load()
  }, [username, currentUser])

  async function handleFollow() {
    if (!currentUser || !profile) return
    setFollowLoading(true)
    const nowFollowing = await toggleFollow(currentUser.id, profile.id)
    setFollowing(nowFollowing)
    setFollowCounts(prev => ({
      ...prev,
      followers: nowFollowing ? prev.followers + 1 : prev.followers - 1
    }))
    setFollowLoading(false)
  }

  const avatarColors = ["#c9a84c", "#3b82f6", "#22c55e", "#a855f7", "#e53030"]
  const avatarColor = profile ? avatarColors[(profile.username?.charCodeAt(0) || 0) % avatarColors.length] : "#c9a84c"
  const initials = profile ? (profile.full_name || profile.username || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?"
  const isOwnProfile = currentUser?.id === profile?.id
  const joinDate = profile ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#080808] pt-20">
          <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse space-y-6">
            <div className="flex gap-6">
              <div className="w-20 h-20 rounded-full bg-[#141414]" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-[#141414] rounded w-48" />
                <div className="h-3 bg-[#141414] rounded w-32" />
                <div className="h-3 bg-[#141414] rounded w-64" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#080808] pt-20 flex items-center justify-center">
          <div className="text-center">
            <Film className="w-12 h-12 text-[#374151] mx-auto mb-4" />
            <p className="font-display text-2xl text-[#e8e8e8]">User not found</p>
            <Link href="/" className="text-[#c9a84c] text-sm mt-3 hover:underline block">← Back to Home</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-20">
        {/* Profile hero */}
        <div className="bg-[#0f0f0f] border-b border-[#1e1e1e]">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-black text-2xl font-bold flex-shrink-0"
                style={{ background: avatarColor }}
              >
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="font-display text-2xl font-bold text-[#e8e8e8]">
                        {profile.full_name || profile.username}
                      </h1>
                      {profile.is_critic && (
                        <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30">
                          Critic
                        </span>
                      )}
                    </div>
                    <p className="text-[#6b7280] text-sm mt-0.5">@{profile.username}</p>
                    {profile.bio && <p className="text-[#9ca3af] text-sm mt-2 max-w-md">{profile.bio}</p>}
                    <div className="flex items-center gap-1.5 mt-2 text-[#4b5563] text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined {joinDate}</span>
                    </div>
                  </div>

                  {/* Follow button */}
                  {!isOwnProfile && currentUser && (
                    <Button
                      variant={following ? "outline" : "default"}
                      size="sm"
                      onClick={handleFollow}
                      disabled={followLoading}
                      className="gap-2"
                    >
                      {following ? <><UserMinus className="w-3.5 h-3.5" /> Unfollow</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Link href="/settings">
                      <Button variant="outline" size="sm">Edit Profile</Button>
                    </Link>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex gap-6 mt-5 pt-5 border-t border-[#1e1e1e]">
                  <div className="text-center">
                    <p className="text-[#e8e8e8] font-bold text-lg">{watchCounts.watched}</p>
                    <p className="text-[#6b7280] text-xs">Watched</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#e8e8e8] font-bold text-lg">{watchCounts.want}</p>
                    <p className="text-[#6b7280] text-xs">Want to Watch</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#e8e8e8] font-bold text-lg">{followCounts.followers}</p>
                    <p className="text-[#6b7280] text-xs">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#e8e8e8] font-bold text-lg">{followCounts.following}</p>
                    <p className="text-[#6b7280] text-xs">Following</p>
                  </div>
                  {profile.helpful_score > 0 && (
                    <div className="text-center">
                      <p className="text-[#c9a84c] font-bold text-lg">{profile.helpful_score}</p>
                      <p className="text-[#6b7280] text-xs">Helpful Votes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex border-b border-[#1e1e1e] mb-8">
            {[
              { key: "reviews", label: "Reviews", icon: <MessageSquare className="w-4 h-4" /> },
              { key: "watchlist", label: "Watchlist", icon: <Bookmark className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest font-semibold border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? "border-[#c9a84c] text-[#c9a84c]"
                    : "border-transparent text-[#6b7280] hover:text-[#9ca3af]"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "reviews" && (
            <div className="text-center py-16 border border-dashed border-[#1e1e1e] rounded-sm">
              <MessageSquare className="w-10 h-10 text-[#374151] mx-auto mb-3" />
              <p className="text-[#6b7280]">No reviews written yet</p>
            </div>
          )}

          {activeTab === "watchlist" && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Want to Watch", count: watchCounts.want, color: "text-[#c9a84c]", status: "want" },
                { label: "Currently Watching", count: watchCounts.watching, color: "text-[#3b82f6]", status: "watching" },
                { label: "Watched", count: watchCounts.watched, color: "text-[#22c55e]", status: "watched" },
              ].map(item => (
                <div key={item.status} className="bg-[#141414] border border-[#1e1e1e] p-5 rounded-sm text-center">
                  <p className={`font-accent text-4xl ${item.color}`}>{item.count}</p>
                  <p className="text-[#6b7280] text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
