-- CineScope Supabase Database Setup
-- Run this SQL in your Supabase project's SQL Editor

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  is_critic boolean DEFAULT false,
  helpful_score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies - drop if exists first
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Allow updates from server endpoints or by the user themselves
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'service_role');

-- Allow inserts from authenticated users or service role
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id OR auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 2. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id integer NOT NULL,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  title text NOT NULL,
  body text NOT NULL,
  is_spoiler boolean DEFAULT false,
  is_critic boolean DEFAULT false,
  helpful integer DEFAULT 0,
  not_helpful integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews FOR UPDATE 
  USING (author_name = auth.jwt() ->> 'email' OR auth.jwt() ->> 'email' ~ ('^admin'));

-- ============================================
-- 3. USER_RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id integer NOT NULL,
  session_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(movie_id, session_id)
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.user_ratings;
DROP POLICY IF EXISTS "Anyone can create ratings" ON public.user_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.user_ratings;

CREATE POLICY "Ratings are viewable by everyone" 
  ON public.user_ratings FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create ratings" 
  ON public.user_ratings FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own ratings" 
  ON public.user_ratings FOR UPDATE 
  USING (session_id = current_setting('app.current_session_id'));

-- ============================================
-- 4. HELPFUL_VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  vote text NOT NULL CHECK (vote IN ('up', 'down')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(review_id, session_id)
);

ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.helpful_votes;
DROP POLICY IF EXISTS "Anyone can vote" ON public.helpful_votes;

CREATE POLICY "Votes are viewable by everyone" 
  ON public.helpful_votes FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can vote" 
  ON public.helpful_votes FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- 5. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can add comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own comments" 
  ON public.comments FOR DELETE 
  USING (user_id = auth.uid());

-- ============================================
-- 6. WATCHLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  movie_title text NOT NULL,
  movie_poster text,
  status text NOT NULL CHECK (status IN ('want', 'watching', 'watched')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can see their own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can add to their watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can update their watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can delete from their watchlist" ON public.watchlist;

CREATE POLICY "Users can see their own watchlist" 
  ON public.watchlist FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can add to their watchlist" 
  ON public.watchlist FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their watchlist" 
  ON public.watchlist FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete from their watchlist" 
  ON public.watchlist FOR DELETE 
  USING (user_id = auth.uid());

-- ============================================
-- 7. FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

CREATE POLICY "Follows are viewable by everyone" 
  ON public.follows FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can follow" 
  ON public.follows FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND follower_id = auth.uid());

CREATE POLICY "Users can unfollow" 
  ON public.follows FOR DELETE 
  USING (follower_id = auth.uid());

-- ============================================
-- 8. WATCHLIST_COLLECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.watchlist_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.watchlist_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own collections" ON public.watchlist_collections;
DROP POLICY IF EXISTS "Users can see public collections" ON public.watchlist_collections;
DROP POLICY IF EXISTS "Users can create collections" ON public.watchlist_collections;
DROP POLICY IF EXISTS "Users can update their collections" ON public.watchlist_collections;
DROP POLICY IF EXISTS "Users can delete their collections" ON public.watchlist_collections;

CREATE POLICY "Users can see their own collections" 
  ON public.watchlist_collections FOR SELECT 
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create collections" 
  ON public.watchlist_collections FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their collections" 
  ON public.watchlist_collections FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their collections" 
  ON public.watchlist_collections FOR DELETE 
  USING (user_id = auth.uid());

-- ============================================
-- 9. COLLECTION_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.watchlist_collections(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  movie_title text NOT NULL,
  movie_poster text,
  added_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(collection_id, movie_id)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see items in their collections" ON public.collection_items;
DROP POLICY IF EXISTS "Users can add to their collections" ON public.collection_items;
DROP POLICY IF EXISTS "Users can remove from their collections" ON public.collection_items;

CREATE POLICY "Users can see items in their collections" 
  ON public.collection_items FOR SELECT 
  USING (collection_id IN (SELECT id FROM public.watchlist_collections WHERE user_id = auth.uid() OR is_public = true));

CREATE POLICY "Users can add to their collections" 
  ON public.collection_items FOR INSERT 
  WITH CHECK (collection_id IN (SELECT id FROM public.watchlist_collections WHERE user_id = auth.uid()));

CREATE POLICY "Users can remove from their collections" 
  ON public.collection_items FOR DELETE 
  USING (collection_id IN (SELECT id FROM public.watchlist_collections WHERE user_id = auth.uid()));

-- ============================================
-- 10. ACTIVITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('review', 'rating', 'watchlist', 'follow')),
  movie_id integer,
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
  related_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activity is viewable by everyone" ON public.activity;
DROP POLICY IF EXISTS "Users can create activity records" ON public.activity;

CREATE POLICY "Activity is viewable by everyone" 
  ON public.activity FOR SELECT 
  USING (true);

CREATE POLICY "Users can create activity records" 
  ON public.activity FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 11. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon_emoji text NOT NULL,
  threshold integer NOT NULL,
  achievement_type text NOT NULL CHECK (achievement_type IN ('reviews', 'rating_count', 'followers', 'helpful_votes')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;

CREATE POLICY "Achievements are viewable by everyone" 
  ON public.achievements FOR SELECT 
  USING (true);

-- ============================================
-- 12. USER_ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.user_achievements;

CREATE POLICY "User achievements are viewable by everyone" 
  ON public.user_achievements FOR SELECT 
  USING (true);

CREATE POLICY "Users can unlock achievements" 
  ON public.user_achievements FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 13. SEED ACHIEVEMENTS
-- ============================================
INSERT INTO public.achievements (badge_name, description, icon_emoji, threshold, achievement_type) VALUES
('Critic', 'Write 10 reviews', '✏️', 10, 'reviews'),
('Film Expert', 'Write 50 reviews', '🎬', 50, 'reviews'),
('Cinephile', 'Write 100 reviews', '🏆', 100, 'reviews'),
('Popular Vote', 'Get 50 helpful votes', '👍', 50, 'helpful_votes'),
('Influential Reviewer', 'Get 200 helpful votes', '⭐', 200, 'helpful_votes'),
('Social Butterfly', 'Get 10 followers', '🦋', 10, 'followers'),
('Influencer', 'Get 50 followers', '🌟', 50, 'followers');

-- ============================================
-- 8. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
-- Note: Supabase automatically creates auth.users, but we need a trigger
-- to auto-create profiles when users sign up.

-- Enable the pgsql extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing trigger and function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 14. CURATED_COLLECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.curated_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  icon_emoji text NOT NULL,
  banner_url text,
  category text NOT NULL CHECK (category IN ('awards', 'genre', 'mood', 'director', 'actor', 'trending', 'trending_reviews')),
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.curated_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Curated collections are viewable by everyone" ON public.curated_collections;

CREATE POLICY "Curated collections are viewable by everyone" 
  ON public.curated_collections FOR SELECT 
  USING (true);

-- ============================================
-- 15. CURATED_COLLECTION_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.curated_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.curated_collections(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  movie_title text NOT NULL,
  movie_poster text,
  movie_rating numeric,
  rank_order integer,
  added_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.curated_collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Curated collection items are viewable by everyone" ON public.curated_collection_items;

CREATE POLICY "Curated collection items are viewable by everyone" 
  ON public.curated_collection_items FOR SELECT 
  USING (true);

-- ============================================
-- 16. RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_movie_id integer NOT NULL,
  recommended_movie_title text NOT NULL,
  recommended_movie_poster text,
  reason text NOT NULL CHECK (reason IN ('similar_user_ratings', 'same_genre', 'director_match', 'actor_match', 'similar_rating_pattern')),
  confidence_score numeric DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  source_movie_id integer,
  source_user_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  viewed_at timestamp with time zone
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own recommendations" ON public.recommendations;

CREATE POLICY "Users can see their own recommendations" 
  ON public.recommendations FOR SELECT 
  USING (user_id = auth.uid());

-- ============================================
-- 17. TRENDING_REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trending_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL UNIQUE,
  movie_id integer NOT NULL,
  helpful_count integer DEFAULT 0,
  engagement_score integer DEFAULT 0,
  trend_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.trending_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trending reviews are viewable by everyone" ON public.trending_reviews;

CREATE POLICY "Trending reviews are viewable by everyone" 
  ON public.trending_reviews FOR SELECT 
  USING (true);

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON public.reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author_name ON public.reviews(author_name);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_ratings_movie_id ON public.user_ratings(movie_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_session_id ON public.user_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_watchlist_collections_user_id ON public.watchlist_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_curated_collections_slug ON public.curated_collections(slug);
CREATE INDEX IF NOT EXISTS idx_curated_collections_category ON public.curated_collections(category);
CREATE INDEX IF NOT EXISTS idx_curated_collections_is_featured ON public.curated_collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_curated_collection_items_collection_id ON public.curated_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_confidence_score ON public.recommendations(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_reviews_trend_date ON public.trending_reviews(trend_date DESC);
CREATE INDEX IF NOT EXISTS idx_trending_reviews_engagement_score ON public.trending_reviews(engagement_score DESC);

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your Supabase database is now set up for CineScope!
-- 
-- Next steps:
-- 1. Make sure auth is enabled in Supabase
-- 2. Test signup/signin with the app
-- 3. If you get "relation does not exist" errors, run this script again
