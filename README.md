# 🎬 CineScope — Movie Review Website

A cinematic, dark-themed Next.js movie review platform with IMDB data integration, shadcn/ui components, and rich interactivity.


## Features

- **Cinematic Hero Section** — Auto-rotating fullscreen showcase with movie backdrops, metadata, and animated transitions
- **IMDB/TMDB Integration** — Live movie data via TMDB API (which includes official IMDB IDs + deep links)
- **Interactive Movie Cards** — Hover effects, watchlist, modal detail view
- **Top Rated Rankings** — Animated rating bars with color-coded scores
- **Genre Filter** — Browse and filter movies by genre with smooth grid transitions
- **Movie Detail Modal** — Full info overlay with poster, backdrop, cast, ratings
- **Responsive** — Mobile-first, works on all screen sizes
- **Custom Design** — Playfair Display + Bebas Neue + DM Sans, cinema gold palette, grain overlay

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Badge, Button, Dialog, Progress)
- **Radix UI primitives**
- **TMDB API** (with IMDB linking)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase database
# IMPORTANT: See SETUP_AUTH.md for detailed instructions
# Run supabase-setup.sql in your Supabase SQL Editor

# 3. Add your API keys
cp .env.local.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_SUPABASE_URL (from Supabase Settings → API)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase Settings → API)
# - TMDB_API_KEY (from https://themoviedb.org/settings/api)

# 4. Run dev server
npm run dev
```

**⚠️ If authentication isn't working:**
1. Read `SETUP_AUTH.md` for complete troubleshooting
2. Run `supabase-setup.sql` in your Supabase project
3. Make sure Email provider is enabled in Authentication settings

Open [http://localhost:3000](http://localhost:3000)

## Getting a TMDB API Key (Free)

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to Settings → API → Create API Key
4. Add to `.env.local` as `TMDB_API_KEY`

TMDB provides full IMDB IDs for every film — the app auto-generates IMDB links like `https://www.imdb.com/title/tt15239678`.

## Project Structure

```
cinescope/
├── app/
│   ├── api/movies/route.ts   # TMDB/IMDB API proxy
│   ├── globals.css           # Cinema aesthetic styles
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                   # shadcn components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── progress.tsx
│   ├── Navbar.tsx            # Sticky nav with search
│   ├── HeroSection.tsx       # Main hero carousel
│   ├── MovieModal.tsx        # Detail modal
│   ├── MovieCard.tsx         # Individual card
│   ├── TrendingSection.tsx   # Horizontal scroll
│   ├── TopRatedSection.tsx   # Ranked list
│   ├── GenreFilter.tsx       # Genre grid
│   └── Footer.tsx
├── lib/
│   ├── movies.ts             # Types + sample data
│   └── utils.ts              # cn() utility
└── .env.local.example
```

## Screenshots

![Screenshot 1](public/images/Screenshot%202026-03-18%20000625.png)

![Screenshot 2](public/images/Screenshot%202026-03-18%20000636.png)

![Screenshot 3](public/images/Screenshot%202026-03-18%20000646.png)

![Screenshot 4](public/images/Screenshot%202026-03-18%20000652.png)

![Screenshot 5](public/images/Screenshot%202026-03-18%20000658.png)
