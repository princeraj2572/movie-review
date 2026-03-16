"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowLeft, Zap, Film, Star } from "lucide-react"

interface Movie {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  release_date: string
}

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchTrending() {
      try {
        // Load multiple pages for more movies
        const [page1, page2, page3] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=1`).then(r => r.json()),
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=2`).then(r => r.json()),
          fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=3`).then(r => r.json()),
        ])
        setMovies([...(page1.results || []), ...(page2.results || []), ...(page3.results || [])])
      } catch (err) {
        console.error("Failed to fetch trending movies:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  const handleImageError = (movieId: number) => {
    setFailedImages(prev => new Set(prev).add(movieId.toString()))
  }

  async function loadMore() {
    setLoadingMore(true)
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=4`
      )
      const data = await response.json()
      setMovies(prev => [...prev, ...(data.results || [])])
    } catch (err) {
      console.error("Failed to load more movies:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-[#6b7280] hover:text-[#c9a84c] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-[#e8e8e8] flex items-center gap-2">
              <Zap className="w-8 h-8 text-[#c9a84c]" />
              Trending Now
            </h1>
            <p className="text-[#9ca3af] mt-1">What's popular this week</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#c9a84c]">Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
              {movies.map(movie => (
                <Link key={movie.id} href={`/movie/${movie.id}`} className="group block">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="w-full">
                        <p className="text-[#c9a84c] font-bold text-sm line-clamp-2">{movie.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[#9ca3af] text-xs">{new Date(movie.release_date).getFullYear()}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#c9a84c] text-[#c9a84c]" />
                            <span className="text-[#c9a84c] text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="border border-[#1e1e1e] hover:border-[#c9a84c]/40 text-[#9ca3af] hover:text-[#c9a84c] px-8 py-3 text-sm uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
