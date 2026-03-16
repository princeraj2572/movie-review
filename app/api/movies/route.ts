import { NextRequest, NextResponse } from "next/server"

const TMDB_BASE = "https://api.themoviedb.org/3"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "trending"
  const id = searchParams.get("id")
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY not configured. Add it to .env.local to fetch live data." },
      { status: 500 }
    )
  }

  try {
    let url = ""

    if (type === "trending") {
      url = `${TMDB_BASE}/trending/movie/week?api_key=${apiKey}`
    } else if (type === "top_rated") {
      url = `${TMDB_BASE}/movie/top_rated?api_key=${apiKey}`
    } else if (type === "now_playing") {
      url = `${TMDB_BASE}/movie/now_playing?api_key=${apiKey}`
    } else if (type === "details" && id) {
      url = `${TMDB_BASE}/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos,external_ids`
    } else if (type === "search") {
      const query = searchParams.get("q") || ""
      url = `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    }

    if (!url) {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }

    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    // Transform TMDB response to our Movie interface
    if (data.results) {
      const movies = data.results.slice(0, 10).map((m: any) => ({
        id: m.id,
        title: m.title,
        tagline: m.tagline || "",
        overview: m.overview,
        poster_path: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : "/placeholder-poster.jpg",
        backdrop_path: m.backdrop_path
          ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
          : "/placeholder-backdrop.jpg",
        release_date: m.release_date,
        vote_average: m.vote_average,
        vote_count: m.vote_count,
        genres: m.genre_ids?.map((gid: number) => ({ id: gid, name: GENRE_MAP[gid] || "Other" })) || [],
        runtime: m.runtime || 120,
        director: "",
        cast: [],
        imdb_id: m.imdb_id || "",
        status: "Released",
        original_language: m.original_language,
        popularity: m.popularity,
      }))
      return NextResponse.json({ movies })
    }

    // Single movie detail
    if (data.id) {
      const director = data.credits?.crew?.find((c: any) => c.job === "Director")?.name || ""
      const cast = data.credits?.cast?.slice(0, 5).map((c: any) => c.name) || []
      const trailer = data.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube")

      return NextResponse.json({
        movie: {
          id: data.id,
          title: data.title,
          tagline: data.tagline || "",
          overview: data.overview,
          poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "",
          backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "",
          release_date: data.release_date,
          vote_average: data.vote_average,
          vote_count: data.vote_count,
          genres: data.genres || [],
          runtime: data.runtime || 120,
          director,
          cast,
          imdb_id: data.external_ids?.imdb_id || data.imdb_id || "",
          trailer_key: trailer?.key,
          budget: data.budget,
          revenue: data.revenue,
          status: data.status,
          original_language: data.original_language,
          popularity: data.popularity,
        }
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch movie data" }, { status: 500 })
  }
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western"
}
