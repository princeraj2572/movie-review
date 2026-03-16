import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { posterUrl, getRatingColor, getYear, type TMDBMovie } from "@/lib/tmdb"

interface RelatedMoviesProps {
  movies: TMDBMovie[]
}

export default function RelatedMovies({ movies }: RelatedMoviesProps) {
  if (!movies.length) return null

  return (
    <div>
      <h3 className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold mb-4">More Like This</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {movies.slice(0, 8).map(movie => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="group block">
            <div className="relative aspect-[2/3] bg-[#1e1e1e] overflow-hidden mb-2 rounded-sm">
              <Image
                src={posterUrl(movie.poster_path)}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="200px"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#080808]/90 px-1.5 py-0.5 rounded-sm">
                <Star className="w-3 h-3 text-[#c9a84c] fill-current" />
                <span className="text-xs font-semibold" style={{ color: getRatingColor(movie.vote_average) }}>
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-[#e8e8e8] text-xs font-medium line-clamp-2 group-hover:text-[#c9a84c] transition-colors leading-tight">
              {movie.title}
            </p>
            <p className="text-[#6b7280] text-[10px] mt-0.5">{getYear(movie.release_date)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
