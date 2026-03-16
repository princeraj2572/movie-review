-- ============================================
-- CineScope Database Verification Queries
-- ============================================
-- Run these in Supabase SQL Editor to verify setup

-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: comments, follows, helpful_votes, profiles, reviews, user_ratings, watchlist

-- 2. Verify profiles table structure
\d+ public.profiles
-- Should show columns: id, email, username, full_name, avatar_url, bio, is_critic, helpful_score, created_at, updated_at

-- 3. Verify profiles has RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
-- Should show rowsecurity = true

-- 4. Check RLS policies on profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
-- Should show 3 policies: one for SELECT, UPDATE, INSERT

-- 5. Test INSERT to profiles (this should work)
-- If you need to test manually:
-- INSERT INTO profiles (id, email, username, full_name, avatar_url, bio, is_critic, helpful_score, created_at)
-- VALUES (auth.uid(), 'test@example.com', 'testuser', 'Test User', '', '', false, 0, now());

-- 6. Check reviews table exists with correct columns
\d+ public.reviews
-- Should have: id, movie_id, author_name, rating, title, body, is_spoiler, is_critic, helpful, not_helpful, created_at, updated_at

-- 7. Check if trigger for auto-profile creation exists
SELECT trigger_name, trigger_event, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND trigger_name LIKE '%auth%'
ORDER BY trigger_name;
-- Should show: on_auth_user_created trigger on auth.users

-- 8. Count of indexes (performance checks)
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
-- Should show indexes on: movie_id, author_name, session_id, user_id, username, etc.

-- 9. Quick data check - no records yet (after fresh setup)
SELECT COUNT(*) as profile_count FROM public.profiles;
SELECT COUNT(*) as review_count FROM public.reviews;
SELECT COUNT(*) as rating_count FROM public.user_ratings;
-- All should be 0 or empty initially

-- 10. Check auth settings (from Supabase UI, not SQL)
-- Authentication → Providers → Email should be ENABLED (green toggle)
-- You should see SMTP status showing email provider is active

-- ============================================
-- If any of these fail:
-- 1. Go back to supabase-setup.sql
-- 2. Run the entire script again
-- 3. Check for error messages (red X marks)
-- 4. Make sure email provider is enabled
-- ============================================
