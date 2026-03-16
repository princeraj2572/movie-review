import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, Calendar, Globe, ArrowLeft, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  fetchMovieDetails, fetchRelatedMovies,
  posterUrl, backdropUrl,
  formatRuntime, getYear, formatCurrency
} from "@/lib/tmdb"
import UserRating from "@/components/movie/UserRating"
import RatingHistogram from "@/components/movie/RatingHistogram"
import CastGrid from "@/components/movie/CastGrid"
import RelatedMovies from "@/components/movie/RelatedMovies"
import ReviewsSection from "@/components/reviews/ReviewsSection"
import WatchlistButton from "@/components/watchlist/WatchlistButton"
import WhereToWatch from "@/components/recommendations/WhereToWatch"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
  const movie = await fetchMovieDetails(Number(params.id))
  if (!movie) return { title: 'Movie Not Found' }
  return {
    title: `${movie.title} (${getYear(movie.release_date)}) — CineScope`,
    description: movie.overview,
  }
}

export default async function MovieDetailPage({ params }: PageProps) {
  const movieId = Number(params.id)
  if (isNaN(movieId)) notFound()

  const [movie, related] = await Promise.all([
    fetchMovieDetails(movieId),
    fetchRelatedMovies(movieId),
  ])

  if (!movie) notFound()

  const director = movie.credits?.crew?.find((c: any) => c.job === 'Director')
  const writers = movie.credits?.crew?.filter((c: any) => c.job === 'Screenplay' || c.job === 'Writer').slice(0, 2) || []
  const trailer = movie.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
  const cast = movie.credits?.cast || []
  const keywords = movie.keywords?.keywords?.slice(0, 10) || []

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808]">

        {/* Hero backdrop */}
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
          <Image
            src={backdropUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-[#080808]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-transparent to-transparent" />

          <div className="absolute top-20 left-6 z-10">
            <Link href="/" className="flex items-center gap-2 text-[#9ca3af] hover:text-[#c9a84c] transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          {trailer && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 bg-white/10 hover:bg-[#c9a84c]/80 border-2 border-white/30 hover:border-[#c9a84c] backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group"
              >
                <Play className="w-6 h-6 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-48 relative z-10 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Poster */}
            <div className="flex-shrink-0 lg:w-56">
              <div className="relative w-40 lg:w-56 aspect-[2/3] border border-[#1e1e1e] shadow-2xl mx-auto lg:mx-0">
                <Image
                  src={posterUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="240px"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2 lg:pt-16">
              <div className="flex gap-2 flex-wrap mb-3">
                {movie.genres.map((g: any) => (
                  <Link key={g.id} href={`/genre/${g.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                    <Badge variant="genre" className="hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-colors cursor-pointer">
                      {g.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e8e8e8] leading-tight mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="font-display italic text-[#c9a84c] text-lg mb-4">&ldquo;{movie.tagline}&rdquo;</p>
              )}

              {/* Meta row — NO TMDB rating */}
              <div className="flex items-center gap-4 flex-wrap mb-4 text-sm text-[#9ca3af]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <span className="text-[#374151]">·</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{movie.release_date}</span>
                </div>
                <span className="text-[#374151]">·</span>
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="uppercase">{movie.original_language}</span>
                </div>
                <span className="text-[#374151]">·</span>
                <span className="border border-[#374151] px-1.5 py-0.5 text-xs">{movie.status}</span>
              </div>

              <p className="text-[#9ca3af] text-base leading-relaxed mb-5 max-w-2xl">{movie.overview}</p>

              {/* Watchlist button */}
              <div className="mb-6">
                <WatchlistButton
                  movieId={movieId}
                  movieTitle={movie.title}
                  moviePoster={posterUrl(movie.poster_path)}
                  variant="full"
                />
              </div>

              {/* Crew */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6 text-sm border-t border-[#1e1e1e] pt-5">
                {director && (
                  <div>
                    <span className="text-[#6b7280] block text-xs uppercase tracking-wider mb-0.5">Director</span>
                    <span className="text-[#e8e8e8] font-medium">{director.name}</span>
                  </div>
                )}
                {writers.length > 0 && (
                  <div>
                    <span className="text-[#6b7280] block text-xs uppercase tracking-wider mb-0.5">Writers</span>
                    <span className="text-[#e8e8e8] font-medium">{writers.map((w: any) => w.name).join(', ')}</span>
                  </div>
                )}
                {movie.budget ? (
                  <div>
                    <span className="text-[#6b7280] block text-xs uppercase tracking-wider mb-0.5">Budget</span>
                    <span className="text-[#e8e8e8] font-medium">{formatCurrency(movie.budget)}</span>
                  </div>
                ) : null}
                {movie.revenue ? (
                  <div>
                    <span className="text-[#6b7280] block text-xs uppercase tracking-wider mb-0.5">Box Office</span>
                    <span className="text-[#e8e8e8] font-medium">{formatCurrency(movie.revenue)}</span>
                  </div>
                ) : null}
              </div>

              {keywords.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {keywords.map((k: any) => (
                    <span key={k.id} className="text-[#4b5563] text-xs border border-[#1e1e1e] px-2 py-1 hover:border-[#374151] hover:text-[#6b7280] transition-colors cursor-default">
                      {k.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Two column layout */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <UserRating movieId={movieId} movieTitle={movie.title} />
              <RatingHistogram movieId={movieId} />
              <WhereToWatch movieId={movieId} />

              {/* Details box */}
              <div className="bg-[#141414] border border-[#1e1e1e] p-5 rounded-sm space-y-3">
                <h3 className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">Details</h3>
                {[
                  { label: 'Status', value: movie.status },
                  { label: 'Language', value: movie.original_language?.toUpperCase() },
                  { label: 'Runtime', value: formatRuntime(movie.runtime) },
                  { label: 'Release Date', value: movie.release_date },
                  { label: 'Budget', value: movie.budget ? formatCurrency(movie.budget) : null },
                  { label: 'Revenue', value: movie.revenue ? formatCurrency(movie.revenue) : null },
                ].filter(d => d.value).map(detail => (
                  <div key={detail.label} className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">{detail.label}</span>
                    <span className="text-[#e8e8e8]">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main */}
            <div className="lg:col-span-2 space-y-12">
              {cast.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-[#c9a84c]" />
                    <h2 className="font-display text-xl font-bold text-[#e8e8e8]">Cast & Crew</h2>
                  </div>
                  <CastGrid cast={cast} />
                </section>
              )}

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-[#c9a84c]" />
                  <h2 className="font-display text-xl font-bold text-[#e8e8e8]">Community Reviews</h2>
                </div>
                <ReviewsSection movieId={movieId} movieTitle={movie.title} />
              </section>

              {related.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-[#c9a84c]" />
                    <h2 className="font-display text-xl font-bold text-[#e8e8e8]">More Like This</h2>
                  </div>
                  <RelatedMovies movies={related} />
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
