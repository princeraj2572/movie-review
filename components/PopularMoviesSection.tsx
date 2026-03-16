"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart, Film } from "lucide-react"
import Link from "next/link"
import { Star } from "lucide-react"

interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

export default function PopularMoviesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=1`
        )
        const data = await response.json()
        setMovies(data.results?.slice(0, 12) || [])
      } catch (err) {
        console.error("Failed to fetch popular movies:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  const handleImageError = (movieId: number) => {
    setFailedImages(prev => new Set(prev).add(movieId.toString()))
  }

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" })
    setTimeout(() => {
      if (!el) return
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    }, 350)
  }

  if (loading) return null

  return (
    <section className="py-16 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#c9a84c]" />
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#c9a84c]" />
                <span className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">Viewer's Choice</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#e8e8e8] mt-0.5">Popular Movies</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-[#1e1e1e] hover:border-[#c9a84c]/50 text-[#9ca3af] hover:text-[#c9a84c]"
                  : "border-[#1e1e1e] text-[#374151] cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 border flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-[#1e1e1e] hover:border-[#c9a84c]/50 text-[#9ca3af] hover:text-[#c9a84c]"
                  : "border-[#1e1e1e] text-[#374151] cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="scroll-container flex gap-4 overflow-x-auto pb-4">
          {movies.map(movie => (
            <Link key={movie.id} href={`/movie/${movie.id}`} className="group flex-shrink-0 w-40">
              <div className="relative bg-[#0f0f0f] rounded-sm overflow-hidden border border-[#1e1e1e] hover:border-[#c9a84c]/40 transition-all duration-300 aspect-[2/3]">
                {failedImages.has(movie.id.toString()) || !movie.poster_path ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e1e1e] to-[#0f0f0f] flex flex-col items-center justify-center gap-2">
                    <Film className="w-8 h-8 text-[#6b7280]" />
                    <span className="text-[#4b5563] text-xs text-center">Image unavailable</span>
                  </div>
                ) : (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={() => handleImageError(movie.id)}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div className="w-full">
                    <p className="text-[#c9a84c] font-bold text-xs line-clamp-2">{movie.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#9ca3af] text-xs">{new Date(movie.release_date).getFullYear()}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#c9a84c] text-[#c9a84c]" />
                        <span className="text-[#c9a84c] text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
