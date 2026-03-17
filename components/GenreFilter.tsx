"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FEATURED_MOVIES } from "@/lib/movies"
import { getYear, GENRE_LIST } from "@/lib/tmdb"

const ALL_GENRES = ["All", "Drama", "Sci-Fi", "Thriller", "Comedy", "History", "Crime", "Romance", "Adventure", "Action", "Fantasy", "Horror"]

export default function GenreFilter() {
  const [active, setActive] = useState("All")

  const filtered = active === "All"
    ? FEATURED_MOVIES
    : FEATURED_MOVIES.filter(m => m.genres.some((g: { id: number; name: string }) => g.name === active))

  const genreSlug = GENRE_LIST.find(g => g.name === active)?.slug

  return (
    <section className="py-16 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#c9a84c]" />
            <div>
              <span className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">Browse</span>
              <h2 className="font-display text-2xl font-bold text-[#e8e8e8] mt-0.5">By Genre</h2>
            </div>
          </div>
          <Link href="/movies" className="text-[#c9a84c] text-xs uppercase tracking-widest hover:underline">
            View All →
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap mb-10">
          {ALL_GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setActive(genre)}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest font-semibold transition-all duration-200 border rounded-sm ${
                active === genre
                  ? "bg-[#c9a84c] text-black border-[#c9a84c]"
                  : "bg-transparent text-[#6b7280] border-[#1e1e1e] hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map(movie => (
            <Link key={movie.id} href={`/movie/${movie.id}`} className="group relative block">
              <div className="relative aspect-[2/3] overflow-hidden bg-[#141414] rounded-sm">
                <Image
                  src={movie.poster_path}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="mt-2 px-0.5">
                <h3 className="text-[#e8e8e8] text-sm font-medium line-clamp-1 group-hover:text-[#c9a84c] transition-colors">
                  {movie.title}
                </h3>
                <p className="text-[#6b7280] text-xs mt-0.5">{getYear(movie.release_date)}</p>
              </div>
            </Link>
          ))}
        </div>

        {active !== "All" && genreSlug && (
          <div className="text-center mt-8">
            <Link href={`/genre/${genreSlug}`} className="border border-[#1e1e1e] hover:border-[#c9a84c]/40 text-[#9ca3af] hover:text-[#c9a84c] px-8 py-3 text-xs uppercase tracking-widest transition-all inline-block rounded-sm">
              See All {active} Films →
            </Link>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[#6b7280]">
            <p className="font-display text-xl">No films found in this genre</p>
            <button onClick={() => setActive("All")} className="mt-4 text-[#c9a84c] text-sm hover:underline">View all films</button>
          </div>
        )}
      </div>
    </section>
  )
}
