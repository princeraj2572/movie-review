"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, X, Film, Bell, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import UserMenu from "@/components/auth/UserMenu"
import AuthModal from "@/components/auth/AuthModal"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [authModal, setAuthModal] = useState<"signin" | "signup" | null>(null)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Movies", href: "/movies" },
    { label: "Trending", href: "/trending" },
    { label: "Top Rated", href: "/top-rated" },
    { label: "Genres", href: "/movies" },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#080808]/95 backdrop-blur-md border-b border-[#1e1e1e]" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center">
              <Film className="w-4 h-4 text-black" />
            </div>
            <span className="font-accent text-2xl text-[#e8e8e8] tracking-widest">CINESCOPE</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.label} href={link.href}
                className="text-[#9ca3af] hover:text-[#c9a84c] text-sm font-medium tracking-wide transition-colors duration-200 uppercase">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 flex items-center justify-center text-[#9ca3af] hover:text-[#c9a84c] transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/watchlist"
                      className="hidden md:flex w-9 h-9 items-center justify-center text-[#9ca3af] hover:text-[#c9a84c] transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </Link>
                    <UserMenu />
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="hidden md:flex text-[#9ca3af] hover:text-[#e8e8e8]"
                      onClick={() => setAuthModal("signin")}>
                      Sign In
                    </Button>
                    <Button variant="cinema" size="sm" className="hidden md:flex"
                      onClick={() => setAuthModal("signup")}>
                      Join Free
                    </Button>
                  </>
                )}
              </>
            )}

            <button className="md:hidden text-[#e8e8e8]" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-16 border-b border-[#1e1e1e]" : "max-h-0"}`}>
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <input type="text" placeholder="Search movies, directors, actors..."
                className="w-full bg-[#141414] border border-[#1e1e1e] text-[#e8e8e8] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]/50 placeholder-[#4b5563] rounded-sm"
                autoFocus={searchOpen}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const searchValue = (e.target as HTMLInputElement).value.trim()
                    if (searchValue) {
                      window.location.href = `/search?q=${encodeURIComponent(searchValue)}`
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-lg" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-16 left-0 right-0 bg-[#0f0f0f] border-b border-[#1e1e1e] transition-transform duration-300 ${menuOpen ? "translate-y-0" : "-translate-y-4"}`}>
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
              className="w-full px-6 py-4 text-left text-[#9ca3af] hover:text-[#c9a84c] hover:bg-[#141414] transition-colors text-sm uppercase tracking-wider border-b border-[#1e1e1e] block">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/watchlist" onClick={() => setMenuOpen(false)}
                className="w-full px-6 py-4 text-left text-[#9ca3af] hover:text-[#c9a84c] hover:bg-[#141414] transition-colors text-sm uppercase tracking-wider border-b border-[#1e1e1e] block">
                My Watchlist
              </Link>
              <Link href={`/profile/${user.username}`} onClick={() => setMenuOpen(false)}
                className="w-full px-6 py-4 text-left text-[#9ca3af] hover:text-[#c9a84c] hover:bg-[#141414] transition-colors text-sm uppercase tracking-wider border-b border-[#1e1e1e] block">
                My Profile
              </Link>
            </>
          ) : (
            <div className="px-6 py-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setMenuOpen(false); setAuthModal("signin") }}>Sign In</Button>
              <Button className="flex-1" onClick={() => { setMenuOpen(false); setAuthModal("signup") }}>Join Free</Button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {authModal && <AuthModal onClose={() => setAuthModal(null)} defaultTab={authModal} />}
    </>
  )
}
