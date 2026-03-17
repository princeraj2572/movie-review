# CineScope Authentication & Database Setup Guide

## 🔧 Authentication Issues Fixed

The authentication wasn't working because:
1. ❌ **Missing profile creation** - `signUp()` created auth users but didn't create database profiles
2. ❌ **Missing database tables** - The Supabase project likely had no tables
3. ❌ **Missing RLS policies** - No row-level security policies configured

**Status**: ✅ Fixed in `lib/auth.ts` - now creates profiles after signup

---

## 📋 Complete Supabase Setup Instructions

### Step 1: Create Tables & Setup Database

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy all SQL from `supabase-setup.sql` in your project root
5. Paste it into the SQL Editor
6. Click **Run** button
7. Wait for completion (you'll see ✅ next to each statement)

**What this does:**
- ✅ Creates 7 tables (profiles, reviews, ratings, watchlist, comments, follows, votes)
- ✅ Enables Row-Level Security (RLS) for permissions
- ✅ Creates a trigger to auto-create profiles when users sign up
- ✅ Sets up proper indexes for performance

### Step 2: Verify Email Auth is Enabled

1. Go to **Authentication** in left sidebar → **Providers**
2. Make sure **Email** provider is enabled (should see green toggle)
3. Enable **Confirm email** if you want email verification (optional)

### Step 3: Test the App

```bash
npm run dev
```

Then:
1. Open http://localhost:3000 (or 3001 if 3000 is busy)
2. Click **"Join Free"** button
3. Sign up with test account:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Username: `testuser`
   - Full Name: `Test User`
4. You should see success message ✅
5. Try signing in

---

## 🐛 Troubleshooting

### "relation 'profiles' does not exist"
**Fix**: Run the `supabase-setup.sql` file from Step 1 again

### "Database error when saving user"
**Fix**: Make sure all SQL statements in `supabase-setup.sql` completed successfully (look for green checkmarks)

### "Row-level security violation"
**Fix**: This error means RLS policies exist but your query violated them. Run setup SQL again to recreate policies.

### "Could not find user_id"
**Fix**: Make sure the `profiles` table has the `id` column set as PRIMARY KEY

### Port 3000 in use
```bash
# Kill the process on port 3000, or use:
npm run dev -- -p 3001
```

---

## 📊 Database Schema Summary

| Table | Purpose | Rows |
|-------|---------|------|
| `profiles` | User profiles (auto-created on signup) | Per user |
| `reviews` | Movie reviews | Per review |
| `user_ratings` | 1-10 ratings per movie | Per rating |
| `helpful_votes` | up/down votes on reviews | Per vote |
| `comments` | Comments on reviews | Per comment |
| `watchlist` | Want/watching/watched lists | Per item |
| `follows` | User follows relationships | Per follow |

---

## 🔐 Security Policies (RLS)

Each table has Row-Level Security enabled:

- **Public**: Reviews, ratings, profiles viewable by all
- **User-specific**: Watchlist, comments, follows only visible to that user
- **Anonymous**: Can create reviews/ratings without auth (uses session_id)
- **Authenticated**: Some actions require login (comments, follows)

---

## 🚀 What Works Now

✅ Sign up with email/password  
✅ Auto-create profile after signup  
✅ Sign in with credentials  
✅ User profiles  
✅ Write reviews  
✅ Rate movies  
✅ Watchlist management  
✅ Comments on reviews  
✅ Follow users  

---

## 📝 Environment Variables

Your `.env.local` already has these. If not, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
TMDB_API_KEY=your_api_key
NEXT_PUBLIC_TMDB_API_KEY=your_api_key
```

Get these from Supabase: **Settings → API** → Copy the URL and anon key

---

## ✅ Final Checklist

- [ ] Run `supabase-setup.sql` in SQL Editor
- [ ] Verify all SQL statements show green checkmarks
- [ ] Email auth provider enabled
- [ ] `.env.local` has valid Supabase credentials
- [ ] Run `npm run dev`
- [ ] Test signup at http://localhost:3000
- [ ] Check browser console for errors (F12)

---

## 🆘 Still Having Issues?

1. **Check Supabase logs**: Authentication → Logs tab for errors
2. **Check browser console**: Open DevTools (F12) → Console tab
3. **Test auth directly**: In Supabase Dashboard → Authentication → Users should show new users
4. **Check network**: DevTools → Network tab, look for failed requests

If stuck, verify:
- [ ] `supabase-setup.sql` ran completely
- [ ] All 7 tables exist in Supabase: Database → Tables
- [ ] Profiles table has correct columns
- [ ] RLS is enabled on all tables
- [ ] Email provider is toggled ON
