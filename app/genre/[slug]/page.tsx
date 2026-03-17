"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Star, SortAsc, ArrowLeft, Film } from "lucide-react"
import { GENRE_LIST, fetchMoviesByGenre, posterUrl, getRatingColor, getYear, type TMDBMovie } from "@/lib/tmdb"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ImageWithFallback from "@/components/ImageWithFallback"

type SortKey = 'popularity' | 'rating' | 'year_desc' | 'year_asc' | 'title'

export default function GenrePage() {
  const params = useParams()
  const slug = params.slug as string

  const genre = GENRE_LIST.find(g => g.slug === slug)

  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortKey>('popularity')
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!genre) return
    setLoading(true)
    setMovies([])
    setPage(1)
    
    // Load first 3 pages to show 60 movies initially
    Promise.all([
      fetchMoviesByGenre(genre.id, 1),
      fetchMoviesByGenre(genre.id, 2),
      fetchMoviesByGenre(genre.id, 3),
    ]).then(([page1, page2, page3]) => {
      setMovies([...page1, ...page2, ...page3])
      setPage(3)
      setLoading(false)
    })
  }, [slug, genre])

  async function loadMore() {
    if (!genre) return
    setLoadingMore(true)
    const nextPage = page + 1
    const data = await fetchMoviesByGenre(genre.id, nextPage)
    setMovies(prev => [...prev, ...data])
    setPage(nextPage)
    setLoadingMore(false)
  }

  const sorted = [...movies].sort((a, b) => {
    if (sort === 'popularity') return b.popularity - a.popularity
    if (sort === 'rating') return b.vote_average - a.vote_average
    if (sort === 'year_desc') return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    if (sort === 'year_asc') return new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
    if (sort === 'title') return a.title.localeCompare(b.title)
    return 0
  })

  if (!genre) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
          <div className="text-center">
            <Film className="w-12 h-12 text-[#374151] mx-auto mb-4" />
            <h1 className="font-display text-2xl text-[#e8e8e8] mb-2">Genre Not Found</h1>
            <Link href="/" className="text-[#c9a84c] hover:underline text-sm">← Back to Home</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-20">

        {/* Header */}
        <div className="bg-[#0f0f0f] border-b border-[#1e1e1e] py-10">
          <div className="max-w-7xl mx-auto px-6">
            <Link href="/movies" className="flex items-center gap-2 text-[#6b7280] hover:text-[#c9a84c] text-sm mb-4 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />
              All Genres
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-1 h-10 bg-[#c9a84c]" />
              <div>
                <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-1">Genre</p>
                <h1 className="font-display text-4xl font-bold text-[#e8e8e8]">{genre.name}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Controls */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="text-[#6b7280] text-sm">
              {loading ? 'Loading...' : `${movies.length}+ ${genre.name} films`}
            </p>
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-[#6b7280]" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="bg-[#141414] border border-[#1e1e1e] text-[#9ca3af] text-sm px-3 py-2 outline-none focus:border-[#c9a84c]/50 rounded-sm"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="year_desc">Newest First</option>
                <option value="year_asc">Oldest First</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-[#141414] rounded-sm mb-2" />
                  <div className="h-3 bg-[#141414] rounded w-3/4 mb-1" />
                  <div className="h-2 bg-[#141414] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sorted.map(movie => (
                  <Link key={movie.id} href={`/movie/${movie.id}`} className="group block">
                    <div className="relative aspect-[2/3] bg-[#141414] overflow-hidden rounded-sm mb-2">
                      <ImageWithFallback
                        src={posterUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-400"
                        sizes="200px"
                      />
                      {/* Rating badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#080808]/90 px-1.5 py-0.5 rounded-sm">
                        <Star className="w-3 h-3 text-[#c9a84c] fill-current" />
                        <span className="text-xs font-semibold" style={{ color: getRatingColor(movie.vote_average) }}>
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[#080808]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-[#9ca3af] text-xs line-clamp-3 leading-relaxed">{movie.overview}</p>
                      </div>
                    </div>
                    <h3 className="text-[#e8e8e8] text-xs font-medium line-clamp-2 group-hover:text-[#c9a84c] transition-colors leading-tight">
                      {movie.title}
                    </h3>
                    <p className="text-[#4b5563] text-[10px] mt-0.5">{getYear(movie.release_date)}</p>
                  </Link>
                ))}
              </div>

              {/* Load more */}
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="border border-[#1e1e1e] hover:border-[#c9a84c]/40 text-[#9ca3af] hover:text-[#c9a84c] px-8 py-3 text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
