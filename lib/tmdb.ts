const TMDB_BASE = 'https://api.themoviedb.org/3'
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '0edd8c72eb9be23672f0f30361ab5d47'

export interface TMDBMovie {
  id: number
  title: string
  tagline: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date: string
  vote_average: number
  vote_count: number
  genres: { id: number; name: string }[]
  runtime: number
  status: string
  original_language: string
  popularity: number
  budget?: number
  revenue?: number
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
    crew: { id: number; name: string; job: string }[]
  }
  videos?: {
    results: { key: string; site: string; type: string }[]
  }
  keywords?: {
    keywords: { id: number; name: string }[]
  }
}

export const GENRE_LIST = [
  { id: 28, name: 'Action', slug: 'action' },
  { id: 12, name: 'Adventure', slug: 'adventure' },
  { id: 16, name: 'Animation', slug: 'animation' },
  { id: 35, name: 'Comedy', slug: 'comedy' },
  { id: 80, name: 'Crime', slug: 'crime' },
  { id: 99, name: 'Documentary', slug: 'documentary' },
  { id: 18, name: 'Drama', slug: 'drama' },
  { id: 10751, name: 'Family', slug: 'family' },
  { id: 14, name: 'Fantasy', slug: 'fantasy' },
  { id: 36, name: 'History', slug: 'history' },
  { id: 27, name: 'Horror', slug: 'horror' },
  { id: 10402, name: 'Music', slug: 'music' },
  { id: 9648, name: 'Mystery', slug: 'mystery' },
  { id: 10749, name: 'Romance', slug: 'romance' },
  { id: 878, name: 'Sci-Fi', slug: 'sci-fi' },
  { id: 53, name: 'Thriller', slug: 'thriller' },
  { id: 10752, name: 'War', slug: 'war' },
  { id: 37, name: 'Western', slug: 'western' },
]

export function getGenreBySlug(slug: string) {
  return GENRE_LIST.find(g => g.slug === slug)
}

export function posterUrl(path: string | null, size = 'w500'): string {
  if (!path) return '/placeholder-poster.jpg'
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function backdropUrl(path: string | null): string {
  if (!path) return '/placeholder-backdrop.jpg'
  return `https://image.tmdb.org/t/p/original${path}`
}

// Fetch trending/now playing movies (multiple pages for variety)
export async function fetchLatestMovies(page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(
    `${TMDB_BASE}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return data.results || []
}

// Fetch popular movies
export async function fetchPopularMovies(page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(
    `${TMDB_BASE}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return data.results || []
}

// Fetch top rated
export async function fetchTopRatedMovies(page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(
    `${TMDB_BASE}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return data.results || []
}

// Fetch movies by genre
export async function fetchMoviesByGenre(genreId: number, page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(
    `${TMDB_BASE}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=${page}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return data.results || []
}

// Fetch full movie details (with credits, videos, keywords)
export async function fetchMovieDetails(id: number): Promise<TMDBMovie | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,keywords&language=en-US`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Search movies
export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  if (!query.trim()) return []
  const res = await fetch(
    `${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`,
    { next: { revalidate: 60 } }
  )
  const data = await res.json()
  return data.results || []
}

// Get related movies
export async function fetchRelatedMovies(id: number): Promise<TMDBMovie[]> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return (data.results || []).slice(0, 8)
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export function getYear(dateString: string): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).getFullYear().toString()
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return '#22c55e'
  if (rating >= 7) return '#c9a84c'
  if (rating >= 6) return '#f97316'
  return '#ef4444'
}

export function formatCurrency(amount: number): string {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(amount)
}
