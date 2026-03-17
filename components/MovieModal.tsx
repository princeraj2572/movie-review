"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X, Star, Clock, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getRatingColor, getYear, formatRuntime } from "@/lib/tmdb"
import { useEffect } from "react"

interface MovieModalProps {
  movie: {
    id: number
    title: string
    tagline?: string
    overview: string
    poster_path: string
    backdrop_path: string
    release_date: string
    vote_average: number
    vote_count: number
    genres: { id: number; name: string }[]
    runtime?: number
    director?: string
  }
  onClose: () => void
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  function goToDetail() {
    onClose()
    router.push(`/movie/${movie.id}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 modal-backdrop" />
      <div
        className="relative w-full max-w-lg bg-[#0f0f0f] border border-[#1e1e1e] overflow-hidden rounded-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Backdrop */}
        <div className="relative h-48">
          <Image src={movie.backdrop_path} alt={movie.title} fill className="object-cover" sizes="600px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-end gap-4">
            <div className="relative w-16 h-24 border border-[#1e1e1e] shadow-xl flex-shrink-0">
              <Image src={movie.poster_path} alt={movie.title} fill className="object-cover" sizes="64px" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#e8e8e8]">{movie.title}</h2>
              {movie.tagline && <p className="font-display italic text-[#c9a84c] text-xs mt-0.5">&ldquo;{movie.tagline}&rdquo;</p>}
            </div>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 bg-[#080808]/80 flex items-center justify-center text-[#9ca3af] hover:text-white border border-[#1e1e1e]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {movie.genres.map(g => <Badge key={g.id} variant="genre">{g.name}</Badge>)}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#c9a84c] fill-current" />
              <span className="font-bold" style={{ color: getRatingColor(movie.vote_average) }}>{movie.vote_average.toFixed(1)}</span>
              <span className="text-[#4b5563] text-xs">/ 10</span>
            </div>
            {movie.runtime && (
              <div className="flex items-center gap-1 text-[#9ca3af]">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[#9ca3af]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{getYear(movie.release_date)}</span>
            </div>
          </div>

          <p className="text-[#9ca3af] text-sm leading-relaxed line-clamp-3">{movie.overview}</p>

          <div className="flex gap-3 pt-1">
            <Button onClick={goToDetail} className="flex-1">
              View Full Details & Reviews
            </Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
