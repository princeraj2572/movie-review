"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, Search, X, Film } from "lucide-react"
import { GENRE_LIST, fetchPopularMovies, searchMovies, posterUrl, getRatingColor, getYear, type TMDBMovie } from "@/lib/tmdb"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ImageWithFallback from "@/components/ImageWithFallback"

const GENRE_ICONS: Record<string, string> = {
  'Action': '💥', 'Adventure': '🗺️', 'Animation': '🎨', 'Comedy': '😂',
  'Crime': '🔫', 'Documentary': '📽️', 'Drama': '🎭', 'Family': '👨‍👩‍👧',
  'Fantasy': '🧙', 'History': '📜', 'Horror': '👻', 'Music': '🎵',
  'Mystery': '🔍', 'Romance': '❤️', 'Sci-Fi': '🚀', 'Thriller': '😱',
  'War': '⚔️', 'Western': '🤠',
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [activeGenre, setActiveGenre] = useState<number | null>(null)

  useEffect(() => {
    async function loadInitialMovies() {
      try {
        // Load first 3 pages to show 60 movies
        const [page1, page2, page3] = await Promise.all([
          fetchPopularMovies(1),
          fetchPopularMovies(2),
          fetchPopularMovies(3),
        ])
        setMovies([...page1, ...page2, ...page3])
      } catch (err) {
        console.error("Failed to load movies:", err)
      }
      setLoading(false)
    }
    loadInitialMovies()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearching(false)
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchMovies(searchQuery)
      setMovies(results)
      setSearching(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter by genre client-side
  const filtered = activeGenre
    ? movies.filter(m => m.genres?.some(g => g.id === activeGenre))
    : movies

  function clearSearch() {
    setSearchQuery("")
    setLoading(true)
    fetchPopularMovies(1).then(data => {
      setMovies(data)
      setLoading(false)
    })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-20">

        {/* Header */}
        <div className="bg-[#0f0f0f] border-b border-[#1e1e1e] py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-10 bg-[#c9a84c]" />
              <div>
                <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-1">Discover</p>
                <h1 className="font-display text-4xl font-bold text-[#e8e8e8]">All Movies</h1>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search movies, directors, actors..."
                className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] pl-11 pr-10 py-3 text-sm outline-none transition-colors placeholder-[#374151] rounded-sm"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#e8e8e8]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Genre browse section */}
          {!searchQuery && (
            <div className="mb-12">
              <h2 className="font-display text-xl font-bold text-[#e8e8e8] mb-5">Browse by Genre</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
                <Link
                  href="/movies"
                  className="flex flex-col items-center gap-1.5 p-3 border border-[#1e1e1e] hover:border-[#c9a84c]/40 bg-[#0f0f0f] hover:bg-[#141414] transition-all group rounded-sm"
                >
                  <span className="text-xl">🎬</span>
                  <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider group-hover:text-[#c9a84c] transition-colors text-center">All</span>
                </Link>
                {GENRE_LIST.map(genre => (
                  <Link
                    key={genre.id}
                    href={`/genre/${genre.slug}`}
                    className="flex flex-col items-center gap-1.5 p-3 border border-[#1e1e1e] hover:border-[#c9a84c]/40 bg-[#0f0f0f] hover:bg-[#141414] transition-all group rounded-sm"
                  >
                    <span className="text-xl">{GENRE_ICONS[genre.name] || '🎬'}</span>
                    <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider group-hover:text-[#c9a84c] transition-colors text-center leading-tight">
                      {genre.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#c9a84c]" />
              <h2 className="font-display text-xl font-bold text-[#e8e8e8]">
                {searchQuery ? `Search results for "${searchQuery}"` : 'Popular Right Now'}
              </h2>
            </div>
            {!loading && (
              <span className="text-[#6b7280] text-sm">{filtered.length} films</span>
            )}
          </div>

          {/* Grid */}
          {loading || searching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-[#141414] rounded-sm mb-2" />
                  <div className="h-3 bg-[#141414] rounded w-3/4 mb-1" />
                  <div className="h-2 bg-[#141414] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-12 h-12 text-[#374151] mx-auto mb-4" />
              <p className="font-display text-xl text-[#6b7280]">No movies found</p>
              <button onClick={clearSearch} className="text-[#c9a84c] text-sm mt-3 hover:underline">
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map(movie => (
                <Link key={movie.id} href={`/movie/${movie.id}`} className="group block">
                  <div className="relative aspect-[2/3] bg-[#141414] overflow-hidden rounded-sm mb-2">
                    <ImageWithFallback
                      src={posterUrl(movie.poster_path)}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-400"
                      sizes="220px"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#080808]/90 px-1.5 py-0.5 rounded-sm">
                      <Star className="w-3 h-3 text-[#c9a84c] fill-current" />
                      <span className="text-xs font-semibold" style={{ color: getRatingColor(movie.vote_average) }}>
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-[#080808]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-[#e8e8e8] text-xs line-clamp-3">{movie.overview}</p>
                    </div>
                  </div>
                  <h3 className="text-[#e8e8e8] text-xs font-medium line-clamp-2 group-hover:text-[#c9a84c] transition-colors leading-tight">
                    {movie.title}
                  </h3>
                  <p className="text-[#4b5563] text-[10px] mt-0.5">{getYear(movie.release_date)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
