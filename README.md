# 🎬 CineScope — Movie Review Website

A cinematic, dark-themed Next.js movie review platform with IMDB data integration, shadcn/ui components, and rich interactivity.

## Screenshots

![Screenshot 1](public/images/Screenshot%202026-03-18%20000625.png)
![Screenshot 3](public/images/Screenshot%202026-03-18%20000646.png)
![Screenshot 4](public/images/Screenshot%202026-03-18%20000652.png)
![Screenshot 5](public/images/Screenshot%202026-03-18%20000658.png)

## ✨ Features

### 🎬 Core Features
- **Cinematic Hero Section** — Auto-rotating fullscreen showcase with movie backdrops, metadata, and animated transitions
- **IMDB/TMDB Integration** — Live movie data via TMDB API (which includes official IMDB IDs + deep links)
- **Interactive Movie Cards** — Hover effects, watchlist, modal detail view
- **Top Rated Rankings** — Animated rating bars with color-coded scores
- **Genre Filter** — Browse and filter movies by genre with smooth grid transitions
- **Movie Detail Modal** — Full info overlay with poster, backdrop, cast, ratings
- **Advanced Search** — Quick search across all movies and reviews
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Custom Design** — Playfair Display + Bebas Neue + DM Sans, cinema gold palette with grain overlay

### 👥 User-Centric Features

#### Watchlist Collections
- Create unlimited custom collections (e.g., "Horror Movies", "2024 Releases", "Must Watch Eventually")
- Add or remove movies from collections instantly
- Make collections public to share with community or keep private
- Organize and manage multiple curated watchlists
- View others' public collections

#### User Following System
- Follow favorite reviewers and critics
- View aggregate stats: follower count, following count
- See public collections from followed users
- Build your personal film community

#### Activity Feed
- Real-time timeline of followed users' activities:
  - 📝 Reviews written
  - ⭐ Movies rated
  - 📋 Watchlist updates
  - 👤 New follows
- Timestamped activity with user context
- Click-through to view full profile or content

#### Achievements & Badges 🏆
Unlock badges for milestones:
- **Critic** ✏️ — Write 10 reviews
- **Film Expert** 🎬 — Write 50 reviews
- **Cinephile** 🏆 — Write 100 reviews
- **Popular Vote** 👍 — Get 50 helpful votes
- **Influential Reviewer** ⭐ — Get 200 helpful votes
- **Social Butterfly** 🦋 — Get 10 followers
- **Influencer** 🌟 — Get 50 followers

Progress bars show how close you are to unlocking each badge. View others' achievements on their profiles.

### 🎯 Discovery & Recommendations

#### Curated Collections
Hand-picked themed collections curated by the community:
- 🏆 **Oscars 2024 Best Picture Nominees** — Official nominees and winners
- 💎 **Underrated Masterpieces** — Hidden gems with exceptional ratings
- 🎥 **Director Spotlight** — Complete works by acclaimed directors (Nolan, etc.)
- 🧠 **Mind-Bending Thrillers** — Movies that twist your brain
- 😄 **Feel-Good Comedies** — Uplifting and hilarious films
- 📈 **Trending This Week** — Most discussed and reviewed movies

Collections are tagged by category (awards, genre, mood, director, actor, trending) and featured prominently for discovery.

#### AI-Powered Recommendations
Smart recommendation engine suggests movies based on:
- Your rating history and patterns
- Similar users' preferences (collaborative filtering)
- Genre and director affinities
- Confidence scoring to rank recommendations
- Prevents recommending already-watched movies

#### Trending Reviews
Discover most-engaging reviews on the platform:
- Sorted by engagement score (helpful votes, comments)
- Shows reviewer name and rating
- One-click access to full review
- Contributes to reviewer's "Influential" badge progress

#### Movie Comparisons
Side-by-side analysis of any two movies:
- **Ratings** — Vote average and vote count comparison
- **Runtime & Release** — Duration and year released
- **Budget & Revenue** — Box office performance
- **Genres** — Similar/different genre tags
- **Overview** — Full synopsis for both films
- **Popularity Metrics** — Trending popularity scores

### 📋 Review & Rating System
- Write detailed reviews with spoiler warnings
- Rate movies 1-10 with intuitive slider
- Vote reviews as helpful/unhelpful
- Comment threads on reviews
- Filter reviews by rating, helpfulness, recency
- Mark reviews as spoiler-containing

### 🔐 User Authentication
- Email/password signup and login via Supabase Auth
- Auto-profile creation on signup
- Persistent authentication with JWT tokens
- Secure role-based access control
- Password reset via email

### 📱 User Profiles
- Customizable profile with avatar, bio, full name
- Display stats: Reviews written, followers, following
- Achievement badges showcase
- Public collections display
- Activity timeline
- Reviews authored by user

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI primitives
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **External APIs**: TMDB API
- **Database**: PostgreSQL via Supabase with Row-Level Security
- **Styling**: Playfair Display, Bebas Neue, DM Sans fonts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- TMDB API key (free)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/princeraj2572/movie-review.git
cd cinescope

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local

# Edit .env.local with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
TMDB_API_KEY=your_tmdb_api_key
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-setup.sql`:
   - Creates all required tables
   - Sets up Row-Level Security policies
   - Seeds initial data (curated collections, achievements)
   - Creates performance indexes

3. Enable Email provider in Authentication settings:
   - Go to Authentication → Providers
   - Enable Email/Password

### Running the App

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Open http://localhost:3000
```

## 📚 Getting a TMDB API Key (Free)

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to Settings → API → Create API Key
4. Add to `.env.local` as `TMDB_API_KEY`

TMDB provides full IMDB IDs for every film — the app auto-generates IMDB links like `https://www.imdb.com/title/tt15239678`.

## 📁 Project Structure

```
cinescope/
├── app/
│   ├── api/
│   │   ├── movies/route.ts              # TMDB/IMDB API proxy
│   │   ├── auth/profile/route.ts        # User profile endpoint
│   │   ├── collections/route.ts         # Watchlist collections API
│   │   ├── follows/route.ts             # Following relationships API
│   │   ├── activity/route.ts            # Activity feed API
│   │   ├── achievements/route.ts        # Achievements & badges API
│   │   ├── curated/route.ts             # Curated collections API
│   │   └── trending/route.ts            # Trending reviews & movies API
│   ├── auth/
│   │   ├── login/page.tsx               # Login page
│   │   ├── signup/page.tsx              # Signup page
│   │   └── callback/route.ts            # OAuth callback
│   ├── genre/[slug]/page.tsx            # Genre detail page
│   ├── movie/[id]/page.tsx              # Movie detail page
│   ├── profile/[username]/page.tsx      # User profile page
│   ├── settings/page.tsx                # User settings
│   ├── watchlist/page.tsx               # User watchlist
│   ├── movies/page.tsx                  # Movies listing
│   ├── search/page.tsx                  # Search results
│   ├── trending/page.tsx                # Trending page
│   ├── top-rated/page.tsx               # Top rated movies
│   ├── globals.css                      # Cinema aesthetic styles
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Home page
│
├── components/
│   ├── ui/                              # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   └── tabs.tsx
│   ├── auth/
│   │   ├── AuthModal.tsx               # Login/signup modal
│   │   ├── AuthProvider.tsx            # Auth context provider
│   │   └── UserMenu.tsx                # User dropdown menu
│   ├── collections/
│   │   └── CollectionsModal.tsx        # Manage watchlist collections
│   ├── social/
│   │   ├── FollowButton.tsx            # Follow/unfollow button
│   │   ├── ActivityFeed.tsx            # Activity timeline
│   │   └── AchievementsBadges.tsx      # Achievement display
│   ├── discovery/
│   │   ├── CuratedCollectionsRow.tsx   # Featured collections grid
│   │   ├── TrendingReviews.tsx         # Trending reviews list
│   │   └── MovieComparison.tsx         # Side-by-side movie comparison
│   ├── reviews/
│   │   ├── ReviewCard.tsx              # Review card component
│   │   ├── ReviewsSection.tsx          # Reviews list
│   │   └── WriteReviewForm.tsx         # Review form
│   ├── comments/
│   │   └── CommentsSection.tsx         # Review comments
│   ├── Navbar.tsx                      # Navigation bar
│   ├── HeroSection.tsx                 # Hero carousel
│   ├── MovieCard.tsx                   # Movie card
│   ├── MovieModal.tsx                  # Movie detail modal
│   ├── GenreFilter.tsx                 # Genre filter
│   ├── SearchResults.tsx               # Search results
│   ├── TrendingSection.tsx             # Trending movies
│   ├── TopRatedSection.tsx             # Top rated movies
│   ├── PopularMoviesSection.tsx        # Popular movies
│   ├── Footer.tsx                      # Footer
│   └── ImageWithFallback.tsx           # Fallback image component
│
├── lib/
│   ├── supabase.ts                     # Supabase client setup
│   ├── session.ts                      # Session management
│   ├── auth.ts                         # Authentication utilities
│   ├── movies.ts                       # Movie data types & helpers
│   ├── tmdb.ts                         # TMDB API integration
│   ├── reviews.ts                      # Review utilities
│   ├── ratings.ts                      # Rating utilities
│   ├── watchlist.ts                    # Watchlist utilities
│   ├── recommendations.ts              # Recommendation engine & trending
│   ├── collections.ts                  # Watchlist collection management
│   ├── follows.ts                      # Follow/follower utilities
│   ├── activity.ts                     # Activity tracking
│   ├── achievements.ts                 # Achievement logic & progression
│   ├── curated.ts                      # Curated collection utilities
│   ├── comments.ts                     # Comment utilities
│   └── utils.ts                        # General utilities (cn, etc.)
│
├── public/
│   └── images/                         # Screenshots
│
├── supabase-setup.sql                  # Database schema & initial setup
├── .env.local.example                  # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🗄️ Database Schema

### Core Tables

**profiles** — User information and stats
```sql
- id (UUID, primary key)
- email, username, full_name, avatar_url, bio
- is_critic, helpful_score, created_at, updated_at
```

**reviews** — Movie reviews
```sql
- id, movie_id, author_name, rating (1-10)
- title, body, is_spoiler, helpful, not_helpful
- created_at, updated_at
```

**user_ratings** — Individual movie ratings
```sql
- id, movie_id, session_id, rating (1-10)
- created_at, UNIQUE(movie_id, session_id)
```

**watchlist** — User watchlist entries
```sql
- id, user_id, movie_id
- status: 'want', 'watching', 'watched'
- created_at, UNIQUE(user_id, movie_id)
```

**follows** — User follow relationships
```sql
- id, follower_id, following_id
- created_at, UNIQUE(follower_id, following_id)
```

### Social & Gamification Tables

**watchlist_collections** — Custom watchlist collections
```sql
- id, user_id, name, description
- is_public, created_at, updated_at
```

**collection_items** — Movies in collections
```sql
- id, collection_id, movie_id, movie_title, movie_poster
- added_at, UNIQUE(collection_id, movie_id)
```

**activity** — User activity tracking
```sql
- id, user_id, activity_type ('review', 'rating', 'watchlist', 'follow')
- movie_id, review_id, related_user_id, description
- created_at
```

**achievements** — Badge definitions
```sql
- id, badge_name, description, icon_emoji
- threshold, achievement_type ('reviews', 'rating_count', 'followers', 'helpful_votes')
- created_at
```

**user_achievements** — User badge progress
```sql
- id, user_id, achievement_id, unlocked_at
- UNIQUE(user_id, achievement_id)
```

### Discovery Tables

**curated_collections** — Admin-created collections
```sql
- id, title, description, slug (UNIQUE)
- icon_emoji, banner_url, category
- display_order, is_featured, created_at, updated_at
```

**curated_collection_items** — Movies in curated collections
```sql
- id, collection_id, movie_id, movie_title, movie_poster
- movie_rating, rank_order, added_at
```

**recommendations** — Personalized recommendations
```sql
- id, user_id, recommended_movie_id, recommended_movie_title
- reason ('similar_user_ratings', 'same_genre', 'director_match', etc.)
- confidence_score (0-1), source_movie_id, source_user_id
- created_at, viewed_at
```

**trending_reviews** — Trending review tracking
```sql
- id, review_id (UNIQUE foreign key), movie_id
- helpful_count, engagement_score
- trend_date, updated_at
```

### Social Tables

**helpful_votes** — Review helpfulness votes
```sql
- id, review_id, session_id
- vote: 'up', 'down' | created_at
- UNIQUE(review_id, session_id)
```

**comments** — Review comments
```sql
- id, review_id, user_id, author_name, body
- created_at
```

## 📡 API Endpoints

### Movies API
```
GET  /api/movies              # Search/filter movies
POST /api/movies              # TMDB proxy
```

### Collections API
```
POST /api/collections         # Create/delete/update/add/remove collection items
```

### Follows API
```
POST /api/follows             # Follow/unfollow, get followers, get following
```

### Activity API
```
POST /api/activity            # Create/get activity feed/user activity
```

### Achievements API
```
POST /api/achievements        # Get achievements, check unlocks, get progress
```

### Curated Collections API
```
POST /api/curated             # Get collections, get by slug, get items, seed
```

### Trending API
```
POST /api/trending            # Get trending reviews, mark trending, update score
```

## 🔒 Security Features

- **Row-Level Security (RLS)** — PostgreSQL policies control data access
- **JWT Authentication** — Supabase Auth with secure tokens
- **Password Hashing** — Bcrypt via Supabase
- **CORS Protection** — API routes restrict cross-origin requests
- **SQL Injection Prevention** — Parameterized queries via Supabase
- **Rate Limiting** — Recommended via Vercel/nginx

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (default)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)

## 🎨 Design System

### Colors
- **Primary**: Amber (#F59E0B) — Cinema gold
- **Dark**: Zinc (#18181B) — Cinematic black
- **Text**: White for light, Zinc-300 for secondary

### Typography
- **Display**: Playfair Display (movie titles)
- **Headlines**: Bebas Neue (hero, sections)
- **Body**: DM Sans (regular text, UI)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙋 Support

For issues, questions, or suggestions, please open an issue on [GitHub](https://github.com/princeraj2572/movie-review/issues).

## 🎬 Roadmap

### Coming Soon
- [ ] Comment threads on reviews
- [ ] Advanced filter & sort options
- [ ] Social sharing (Twitter, Facebook)
- [ ] Email notifications
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)
- [ ] PWA support (offline mode)
- [ ] Admin dashboard
- [ ] Advanced recommendation algorithm
- [ ] Multi-language support

---

**Made with 🎬 and ❤️ for movie lovers**
