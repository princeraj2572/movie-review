# Cinescope Authentication Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - **Name**: cinescope
   - **Database Password**: Save this securely! (auto-generated)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier works fine for development
5. Click "Create new project" and wait for initialization (2-3 minutes)

---

## Step 2: Get Your Supabase Credentials

After project creation:

1. Go to **Settings > API** in left sidebar
2. Copy these values to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**File location**: Create/edit `e:\Project\xd\cinescope\.env.local`

Example (these are fake - use your real ones):
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key
```

---

## Step 3: Create Database Tables

1. In Supabase, go to **SQL Editor** in left sidebar
2. Click **"New query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_critic BOOLEAN DEFAULT false,
  helpful_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id INTEGER NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating FLOAT NOT NULL CHECK (rating >= 0 AND rating <= 10),
  title TEXT NOT NULL,
  body TEXT,
  is_spoiler BOOLEAN DEFAULT false,
  is_critic BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  not_helpful INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_ratings table
CREATE TABLE public.user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating FLOAT NOT NULL CHECK (rating >= 0 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, user_id)
);

-- Create watchlist table
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create helpful_votes table
CREATE TABLE public.helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote TEXT CHECK (vote IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
```

---

## Step 4: Set Up Row Level Security (RLS) Policies

Go back to **SQL Editor** and run this:

```sql
-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Reviews: Anyone can read, users can write/edit their own
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = author_id);

-- Ratings: Users can manage their own
CREATE POLICY "Users can view all ratings" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own rating" ON public.user_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rating" ON public.user_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rating" ON public.user_ratings FOR DELETE USING (auth.uid() = user_id);

-- Watchlist: Private to user
CREATE POLICY "Users can view their own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- Follows: Public read, users manage their own
CREATE POLICY "Follows are public" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Helpful votes: Public read, users manage their own
CREATE POLICY "Votes are public" ON public.helpful_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.helpful_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON public.helpful_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their vote" ON public.helpful_votes FOR DELETE USING (auth.uid() = user_id);

-- Comments: Public read, users manage their own
CREATE POLICY "Comments are public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can edit their comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);
```

---

## Step 5: Enable Email Authentication

1. Go to **Authentication > Providers** in Supabase
2. Find **Email** and make sure it's enabled
3. Click on Email provider
4. Under **Confirm email**, toggle ON "Confirm email"

---

## Step 6: Configure Email Templates (Optional but Recommended)

Go to **Authentication > Email Templates**:

Optional: Customize the confirmation and password reset emails with your branding.

---

## Step 7: Test Authentication

### Test Sign Up:
```bash
cd e:\Project\xd\cinescope
npm run dev
```

1. Open browser: `http://localhost:3000`
2. Click **Sign In** button in navbar
3. Switch to **Create Account** tab
4. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Full Name: `Test User`
   - Password: `Password123!`
5. Click **Create Account**

**Expected result**: 
- Account created successfully message
- Check Supabase: **Authentication > Users** should show your new user

### Test Sign In:
1. Click **Sign In** in navbar
2. Enter your credentials
3. Click **Sign In**

**Expected result**:
- Redirects to home page
- User menu appears in navbar with your username

---

## Common Issues & Solutions

### ❌ Error: "Invalid API key"
**Solution**: 
- Verify `.env.local` file exists in project root
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Restart dev server: `npm run dev`

### ❌ Error: "Profile already exists"
**Solution**:
- Go to Supabase > **SQL Editor**
- Clear existing data with: `TRUNCATE TABLE public.profiles CASCADE;`
- Try signing up again

### ❌ Email confirmation not working
**Solution**:
1. In Supabase > **Authentication > Providers > Email**
2. Check "Confirm email" is toggled ON
3. Under "Email change requires confirmation" also toggle ON

### ❌ Service role key error
**Solution**:
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- This is needed for server-side operations like profile creation
- Never expose this in frontend code

### ❌ User created but no profile
**Solution**:
1. Check `/api/auth/profile` endpoint is working
2. Go to Supabase > **SQL Editor** > Run:
```sql
SELECT * FROM public.profiles;
```
3. If empty, manually create: 
```sql
INSERT INTO public.profiles (id, email, username, full_name)
VALUES ('user-id-here', 'user@example.com', 'username', 'Full Name');
```

---

## File Structure Reference

Your authentication files are already in place:

```
cinescope/
├── lib/
│   ├── auth.ts           ✅ Auth functions
│   ├── supabase.ts       ✅ Supabase client
│   └── session.ts        ✅ Session handling
├── components/auth/
│   ├── AuthProvider.tsx  ✅ Auth context
│   ├── AuthModal.tsx     ✅ Login/signup modal
│   └── UserMenu.tsx      ✅ User dropdown
├── app/api/auth/
│   └── profile/route.ts  ✅ Profile creation endpoint
├── .env.local            ❓ Create this file!
└── next.config.js
```

---

## Next Steps After Authentication Works

1. ✅ Test sign up and sign in
2. ✅ Create a user profile page
3. ✅ Add movie ratings functionality
4. ✅ Add reviews functionality
5. ✅ Add watchlist functionality

---

## Quick Checklist

- [ ] Supabase project created
- [ ] `.env.local` file created with credentials
- [ ] Database tables created (SQL executed)
- [ ] RLS policies set up
- [ ] Email authentication enabled
- [ ] Sign up test completed
- [ ] Sign in test completed
- [ ] User appears in Supabase > Users
- [ ] Profile appears in Supabase > profiles table

---

## Need Help?

Check your Supabase dashboard:
- **Auth** section to see created users
- **Database** section to verify tables exist
- **Logs** section for any errors

Good luck! 🎬
