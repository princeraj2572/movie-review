"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { User, Bookmark, LogOut, ChevronDown, Star } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useAuth } from "./AuthProvider"

export default function UserMenu() {
  const { user, refresh } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleSignOut() {
    await signOut()
    await refresh()
    setOpen(false)
  }

  if (!user) return null

  const initials = (user.full_name || user.username || "U")
    .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  const avatarColors = ["#c9a84c", "#3b82f6", "#22c55e", "#a855f7", "#e53030"]
  const color = avatarColors[(user.username?.charCodeAt(0) || 0) % avatarColors.length]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold"
          style={{ background: color }}
        >
          {initials}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#6b7280] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#141414] border border-[#1e1e1e] rounded-sm shadow-xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#1e1e1e]">
            <p className="text-[#e8e8e8] text-sm font-semibold truncate">
              {user.full_name || user.username}
            </p>
            <p className="text-[#4b5563] text-xs truncate">@{user.username}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href={`/profile/${user.username}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#e8e8e8] hover:bg-[#1e1e1e] transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              href="/watchlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#e8e8e8] hover:bg-[#1e1e1e] transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              My Watchlist
            </Link>
            <Link
              href={`/profile/${user.username}#ratings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#e8e8e8] hover:bg-[#1e1e1e] transition-colors"
            >
              <Star className="w-4 h-4" />
              My Ratings
            </Link>
          </div>

          <div className="border-t border-[#1e1e1e] py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#e53030] hover:bg-[#1e1e1e] transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
