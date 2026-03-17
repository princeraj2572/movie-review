"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Play, Clock, Calendar, ChevronLeft, ChevronRight, Volume2, VolumeX, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FEATURED_MOVIES, formatRuntime, getYear, type Movie } from "@/lib/movies"
import MovieModal from "./MovieModal"
import ImageWithFallback from "./ImageWithFallback"

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [muted, setMuted] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [autoplay, setAutoplay] = useState(true)
  const [progress, setProgress] = useState(0)

  const movies = FEATURED_MOVIES.slice(0, 5)
  const movie = movies[current]

  const goTo = useCallback((index: number, dir: "left" | "right") => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setPrev(current)
    setDirection(dir)
    setProgress(0)
    setTimeout(() => {
      setCurrent(index)
      setPrev(null)
      setIsTransitioning(false)
    }, 600)
  }, [current, isTransitioning])

  const next = useCallback(() => goTo((current + 1) % movies.length, "right"), [current, goTo, movies.length])
  const prev_ = useCallback(() => goTo((current - 1 + movies.length) % movies.length, "left"), [current, goTo, movies.length])

  useEffect(() => {
    if (!autoplay) return
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          next()
          return 0
        }
        return p + 0.5
      })
    }, 80)
    return () => clearInterval(interval)
  }, [autoplay, next])

  const getRatingStars = (rating: number) => {
    const stars = Math.round(rating / 2)
    return Array.from({ length: 5 }, (_, i) => i < stars)
  }

  return (
    <>
      <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
        {/* Background Images */}
        {movies.map((m, i) => (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="absolute inset-0">
              <ImageWithFallback
                src={m.backdrop_path}
                alt={m.title}
                fill
                className="object-cover object-center"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
            {/* Cinematic overlays */}
            <div className="absolute inset-0 hero-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full pt-16">
            <div className="max-w-2xl">
              {/* Now showing label */}
              <div
                key={`label-${current}`}
                className="animate-on-mount stagger-1 flex items-center gap-3 mb-6"
              >
                <div className="w-8 h-px bg-[#c9a84c]" />
                <span className="text-[#c9a84c] uppercase tracking-[0.3em] text-xs font-semibold font-body">
                  Now Showing
                </span>
                <span className="text-[#6b7280] text-xs uppercase tracking-wider">#{(current + 1).toString().padStart(2, '0')}</span>
              </div>

              {/* Title */}
              <h1
                key={`title-${current}`}
                className="animate-on-mount stagger-2 font-display text-5xl md:text-7xl font-bold text-[#e8e8e8] leading-none mb-3"
                style={{ animationDelay: "0.1s" }}
              >
                {movie.title}
              </h1>

              {/* Tagline */}
              {movie.tagline && (
                <p
                  key={`tag-${current}`}
                  className="animate-on-mount stagger-3 font-display italic text-[#c9a84c] text-lg mb-5"
                  style={{ animationDelay: "0.2s" }}
                >
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Meta row */}
              <div
                key={`meta-${current}`}
                className="animate-on-mount stagger-3 flex items-center gap-4 mb-5 flex-wrap"
                style={{ animationDelay: "0.25s" }}
              >
                {/* Rating */}
                {/* Runtime */}
                <div className="flex items-center gap-1.5 text-[#9ca3af] text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>

                <div className="w-px h-4 bg-[#1e1e1e]" />

                {/* Year */}
                <div className="flex items-center gap-1.5 text-[#9ca3af] text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{getYear(movie.release_date)}</span>
                </div>
              </div>

              {/* Genres */}
              <div
                key={`genres-${current}`}
                className="animate-on-mount stagger-4 flex gap-2 mb-6 flex-wrap"
                style={{ animationDelay: "0.3s" }}
              >
                {movie.genres.map(g => (
                  <Badge key={g.id} variant="genre">{g.name}</Badge>
                ))}
              </div>

              {/* Overview */}
              <p
                key={`overview-${current}`}
                className="animate-on-mount stagger-4 text-[#9ca3af] text-sm md:text-base leading-relaxed mb-8 line-clamp-3 max-w-xl"
                style={{ animationDelay: "0.35s" }}
              >
                {movie.overview}
              </p>

              {/* Director */}
              <p
                key={`dir-${current}`}
                className="animate-on-mount stagger-4 text-xs text-[#6b7280] mb-8 uppercase tracking-wider"
                style={{ animationDelay: "0.38s" }}
              >
                <span className="text-[#c9a84c]">Dir.</span> {movie.director}
              </p>

              {/* Actions */}
              <div
                key={`actions-${current}`}
                className="animate-on-mount stagger-5 flex items-center gap-4 flex-wrap"
                style={{ animationDelay: "0.4s" }}
              >
                <Link href={`/movie/${movie.id}`}>
                  <Button
                    size="lg"
                    className="btn-ticket bg-[#c9a84c] text-black hover:bg-[#f0c060] font-semibold px-8 gap-3 group"
                  >
                    <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 group"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <Info className="w-4 h-4 group-hover:text-[#c9a84c] transition-colors" />
                  Quick View
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Thumbnail previews */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3">
          {movies.map((m, i) => (
            <button
              key={m.id}
              onClick={() => goTo(i, i > current ? "right" : "left")}
              className={`relative w-20 h-28 overflow-hidden rounded-sm transition-all duration-300 ${
                i === current
                  ? "ring-1 ring-[#c9a84c] scale-110 opacity-100"
                  : "opacity-40 hover:opacity-70 hover:scale-105"
              }`}
            >
              <ImageWithFallback src={m.poster_path} alt={m.title} fill className="object-cover" sizes="80px" />
              {i === current && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e1e1e]">
                  <div
                    className="h-full bg-[#c9a84c] transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Bottom navigation & indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {movies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? "right" : "left")}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? "w-8 h-1.5 bg-[#c9a84c]"
                      : "w-1.5 h-1.5 bg-[#374151] hover:bg-[#6b7280]"
                  }`}
                />
              ))}
            </div>

            {/* Arrow controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoplay(a => !a)}
                className="w-8 h-8 flex items-center justify-center text-[#6b7280] hover:text-[#c9a84c] transition-colors"
                title={autoplay ? "Pause autoplay" : "Resume autoplay"}
              >
                {autoplay ? (
                  <span className="text-xs font-semibold">⏸</span>
                ) : (
                  <span className="text-xs font-semibold">▶</span>
                )}
              </button>
              <button
                onClick={prev_}
                className="w-9 h-9 border border-[#1e1e1e] hover:border-[#c9a84c]/50 flex items-center justify-center text-[#9ca3af] hover:text-[#c9a84c] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 border border-[#1e1e1e] hover:border-[#c9a84c]/50 flex items-center justify-center text-[#9ca3af] hover:text-[#c9a84c] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2">
          <div className="w-5 h-8 border border-[#374151] rounded-full flex justify-center pt-1.5">
            <div className="w-0.5 h-2 bg-[#c9a84c] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Ticker bar */}
      <div className="bg-[#c9a84c] py-2 overflow-hidden">
        <div className="ticker-content text-black text-xs font-semibold uppercase tracking-widest">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="inline-block">
              {movies.map(m => (
                <span key={m.id} className="inline-block mx-8">
                  ★ {m.title} — {m.vote_average.toFixed(1)}/10
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Movie detail modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </>
  )
}
