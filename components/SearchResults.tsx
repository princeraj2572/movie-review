"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Search, Film } from "lucide-react"

interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!query.trim()) {
      setMovies([])
      return
    }

    async function search() {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
        )
        const data = await response.json()
        setMovies(data.results || [])
        if (!data.results?.length) {
          setError("No movies found matching your search.")
        }
      } catch (err) {
        setError("Failed to search. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query])

  const handleImageError = (movieId: number) => {
    setFailedImages(prev => new Set(prev).add(movieId.toString()))
  }

  return (
    <>
      {query && (
        <p className="text-[#9ca3af] mb-6">
          Showing results for "<span className="text-[#c9a84c] font-semibold">{query}</span>"
        </p>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-[#c9a84c]">Searching...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
          <p className="text-[#6b7280]">{error}</p>
        </div>
      )}

      {movies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  <div>
                    <p className="text-[#c9a84c] font-bold text-sm line-clamp-2">{movie.title}</p>
                    {movie.release_date && (
                      <p className="text-[#9ca3af] text-xs">{new Date(movie.release_date).getFullYear()}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && movies.length === 0 && query && !error && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
          <p className="text-[#6b7280]">No results found for "{query}"</p>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
          <p className="text-[#6b7280]">Use the search bar to find movies</p>
        </div>
      )}
    </>
  )
}
