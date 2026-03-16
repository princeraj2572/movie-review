"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Award, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getYear, formatRuntime, type TMDBMovie } from "@/lib/tmdb"
import ImageWithFallback from "./ImageWithFallback"

export default function TopRatedSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchTopRated() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=1&language=en-US`
        )
        const data = await response.json()
        setMovies(data.results || [])
      } catch (err) {
        console.error("Failed to fetch top rated movies:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopRated()
  }, [])

  const handleImageError = (movieId: number) => {
    setFailedImages(prev => new Set(prev).add(movieId.toString()))
  }

  async function loadMore() {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${nextPage}&language=en-US`
      )
      const data = await response.json()
      setMovies(prev => [...prev, ...(data.results || [])])
      setPage(nextPage)
    } catch (err) {
      console.error("Failed to load more movies:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const displayedMovies = showAll ? movies : movies.slice(0, 5)

  if (loading) return null

  return (
    <section className="py-16 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-1 h-8 bg-[#c9a84c]" />
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#c9a84c]" />
              <span className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">Rankings</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#e8e8e8] mt-0.5">Top Rated Films</h2>
          </div>
        </div>

        <div className="space-y-3">
          {displayedMovies.map((movie, i) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className={`group relative flex items-center gap-5 p-4 border transition-all duration-300 block ${
                hoveredId === movie.id ? "border-[#c9a84c]/30 bg-[#141414]" : "border-[#1e1e1e] bg-[#0f0f0f] hover:border-[#2a2a2a]"
              }`}
              onMouseEnter={() => setHoveredId(movie.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="w-8 flex-shrink-0 text-center">
                <span className={`font-accent text-3xl transition-colors duration-300 ${
                  i === 0 ? "text-[#c9a84c]" : i === 1 ? "text-[#9ca3af]" : i === 2 ? "text-[#b87333]" : "text-[#374151]"
                }`}>
                  {(i + 1).toString().padStart(2, "0")}
                </span>
              </div>

              <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden">
                {failedImages.has(movie.id.toString()) ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e1e1e] to-[#0f0f0f] flex items-center justify-center text-[#4b5563] text-xs">–</div>
                ) : (
                  <ImageWithFallback src={movie.poster_path} alt={movie.title} fill className="object-cover" sizes="48px" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-[#e8e8e8] font-semibold group-hover:text-[#c9a84c] transition-colors leading-tight">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[#6b7280] text-xs">{getYear(movie.release_date)}</span>
                      <span className="text-[#374151] text-xs">·</span>
                      <span className="text-[#6b7280] text-xs">{movie.vote_average.toFixed(1)} ★</span>
                      <span className="text-[#374151] text-xs">·</span>
                      <span className="text-[#6b7280] text-xs">{movie.vote_count.toLocaleString()} votes</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 hidden md:block">
                  <Progress value={(movie.vote_average / 10) * 100} />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {movie.genres?.slice(0, 3).map((g: { id: number; name: string }) => (
                    <Badge key={g.id} variant="genre" className="text-[9px]">{g.name}</Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-8 text-center">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="border border-[#1e1e1e] hover:border-[#c9a84c]/40 text-[#9ca3af] hover:text-[#c9a84c] px-8 py-3 text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              <span>View More Top Rated</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          ) : movies.length > displayedMovies.length ? (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="border border-[#1e1e1e] hover:border-[#c9a84c]/40 text-[#9ca3af] hover:text-[#c9a84c] px-8 py-3 text-sm uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
