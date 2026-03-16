"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { getPopularRecommendations } from "@/lib/recommendations"
import { posterUrl, getYear, type TMDBMovie } from "@/lib/tmdb"

interface RecommendationsRowProps {
  title?: string
  excludeId?: number
}

export default function RecommendationsRow({
  title = "Recommended For You",
  excludeId
}: RecommendationsRowProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPopularRecommendations().then(data => {
      setMovies(data.filter(m => m.id !== excludeId).slice(0, 10))
      setLoading(false)
    })
  }, [excludeId])

  if (loading) {
    return (
      <div className="py-8">
        <div className="h-4 bg-[#141414] rounded w-48 mb-5 animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 animate-pulse">
              <div className="aspect-[2/3] bg-[#141414] rounded-sm mb-2" />
              <div className="h-2 bg-[#141414] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!movies.length) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-4 h-4 text-[#c9a84c]" />
        <h3 className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">{title}</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto scroll-container pb-2">
        {movies.map(movie => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="flex-shrink-0 w-32 group">
            <div className="relative aspect-[2/3] bg-[#141414] overflow-hidden rounded-sm mb-2">
              <Image
                src={posterUrl(movie.poster_path)}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="130px"
              />
            </div>
            <p className="text-[#e8e8e8] text-xs font-medium line-clamp-2 leading-tight group-hover:text-[#c9a84c] transition-colors">
              {movie.title}
            </p>
            <p className="text-[#4b5563] text-[10px] mt-0.5">{getYear(movie.release_date)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
