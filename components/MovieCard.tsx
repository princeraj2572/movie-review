"use client"

import { useState } from "react"
import Link from "next/link"
import { BookmarkPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getYear, formatRuntime } from "@/lib/tmdb"
import ImageWithFallback from "./ImageWithFallback"

interface MovieCardProps {
  movie: {
    id: number
    title: string
    poster_path: string
    vote_average: number
    release_date: string
    runtime?: number
    genres?: { id: number; name: string }[]
    director?: string
  }
  index?: number
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const [wishlisted, setWishlisted] = useState(false)

  return (
    <div className="movie-card group relative flex-shrink-0 w-44 md:w-48" style={{ animationDelay: `${index * 0.08}s` }}>
      <Link href={`/movie/${movie.id}`}>
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#141414]">
          <ImageWithFallback
            src={movie.poster_path}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="200px"
          />
          <div className="absolute inset-0 bg-[#080808]/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white text-xs font-semibold bg-[#c9a84c] px-3 py-1.5 rounded-sm">
              View Details
            </span>
          </div>
          <div className="absolute top-2 right-2 bg-[#080808]/90 px-1.5 py-0.5 rounded-sm">
            <span className="text-[#9ca3af] text-xs">{getYear(movie.release_date)}</span>
          </div>
        </div>
      </Link>

      <div className="mt-3 px-0.5">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="text-[#e8e8e8] text-sm font-medium leading-tight line-clamp-1 group-hover:text-[#c9a84c] transition-colors">
            {movie.title}
          </h3>
        </Link>
        {movie.director && (
          <p className="text-[#6b7280] text-xs mt-1 line-clamp-1">{movie.director}</p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            {movie.runtime ? (
              <span className="text-[#6b7280] text-xs">{formatRuntime(movie.runtime)}</span>
            ) : null}
            {movie.genres?.[0] && (
              <Badge variant="genre" className="text-[9px] px-1.5 py-0">{movie.genres[0].name}</Badge>
            )}
          </div>
          <button
            onClick={() => setWishlisted(w => !w)}
            className={`transition-colors ${wishlisted ? "text-[#c9a84c]" : "text-[#374151] hover:text-[#6b7280]"}`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
