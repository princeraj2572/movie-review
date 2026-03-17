# Authentication Troubleshooting Guide

## Quick Start (If you haven't already done this)

### 1. Create `.env.local` file

Create a new file called `.env.local` in your project root (`e:\Project\xd\cinescope\.env.local`)

Add this content and fill in YOUR values from Supabase:

```env
# Supabase URLs and Keys (from Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

### 2. Where to find your Supabase Credentials

Go to: **Supabase Dashboard > Settings > API**

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Anon (Public) Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Testing Authentication Step by Step

### Step 1: Verify Environment Variables

Run this in terminal to check if variables are loaded:

```bash
cd e:\Project\xd\cinescope
npm run dev
```

Check the console for any warnings about missing environment variables.

### Step 2: Test Supabase Connection

Open your browser console and run:

```javascript
// Check if Supabase is accessible
fetch('https://YOUR_SUPABASE_URL/rest/v1/', {
  headers: { apikey: 'YOUR_ANON_KEY' }
}).then(r => r.json()).then(console.log)
```

Should return: `{ "version": "..." }` ✅

### Step 3: Sign Up Test

1. Go to `http://localhost:3000`
2. Click the **Sign In** button in navbar
3. Click **Create Account** tab
4. Fill in form with:
   - Email: `test123@example.com` (use a real email or temp email)
   - Username: `testuser123` (must be unique!)
   - Password: `Test@1234` (must be 6+ chars)
5. Click **Create Account**

### Step 4: Verify in Supabase

Check if user was created:

1. Open Supabase Dashboard
2. Go to **Authentication > Users**
3. Look for your email address
4. User should appear there ✅

Check if profile was created:

1. Go to **Database > tables > profiles**
2. Look for a row with your username
3. Profile should appear there ✅

---

## Common Issues and Fixes

### Issue 1: "Sign up button does nothing"

**Possible causes:**
- Environment variables not loaded
- Network error connecting to Supabase

**Fix:**
```bash
# Restart dev server
npm run dev

# Check .env.local exists and has correct values
type .env.local
```

**Verify:**
- Does `.env.local` file exist?
- Are the values filled in (not empty)?
- Did you restart `npm run dev` after creating `.env.local`?

---

### Issue 2: "Error: Invalid login credentials"

**This is actually expected!** It means:
- You're trying to sign in with wrong email/password
- OR the user doesn't exist yet

**Fix:**
1. Try signing up first (not signing in)
2. Use a new email address that doesn't exist yet
3. Remember: passwords are case-sensitive

---

### Issue 3: "Error: Email already registered"

**This means:**
- You're trying to sign up with an email that already has an account

**Fix:**
1. Try **Sign In** instead with that email
2. OR use a different email for **Create Account**
3. To clear test accounts, go to Supabase Dashboard > **Authentication > Users** > click user > **Delete user**

---

### Issue 4: "Network error / Failed to fetch"

**This usually means:**
- Supabase URL is incorrect
- Anon key is incorrect or expired
- Supabase project is paused (free tier can pause after 7 days of inactivity)

**Fix:**
1. Double-check `NEXT_PUBLIC_SUPABASE_URL` - should look like:
   ```
   https://xxxxxxxx.supabase.co
   ```
   (NOT with `/rest/v1/` at the end!)

2. Double-check `NEXT_PUBLIC_SUPABASE_ANON_KEY` - should be a long string starting with `eyJ`

3. Check if your Supabase project is active:
   - Go to Supabase Dashboard
   - Look for a "Paused" indicator
   - Click to resume if needed

---

### Issue 5: "Profile creation failed"

**This means:**
- User was created in auth, but profile table entry failed

**Possible causes:**
- `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong
- tables don't exist
- RLS policies are blocking

**Fix:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
2. Restart dev server: `npm run dev`
3. Try signing up again

**If still failing:**
```bash
# Clear tables and try again
# In Supabase SQL Editor, run:
TRUNCATE TABLE public.profiles CASCADE;
```

Then try signing up again.

---

### Issue 6: Signed in but no user menu appears

**This means:**
- Authentication worked
- But `useAuth()` hook isn't returning user data

**Fix:**
1. Check that `AuthProvider` wraps your app
2. Look in your `app/layout.tsx` - should have:
   ```tsx
   <AuthProvider>
     {children}
   </AuthProvider>
   ```

3. Clear browser cache and hard refresh (Ctrl+Shift+R)

4. Check browser console for any errors

---

## Testing Checklist

When testing, verify each step:

- [ ] Can access `http://localhost:3000` without errors
- [ ] Sign In button appears in navbar
- [ ] Can click Sign In button → modal opens
- [ ] Can fill form with email, password, username
- [ ] "Create Account" button works
- [ ] See success message OR error message (not timeout)
- [ ] Check Supabase Dashboard > Users (user appears there)
- [ ] Check Supabase Dashboard > profiles table (profile appears there)
- [ ] Can sign in with the email/password
- [ ] Username appears in navbar after signing in
- [ ] Can click username → dropdown menu

---

## Debug Console Commands

Run these in browser console (F12) to debug:

```javascript
// Check if Supabase client loaded
window.supabase ? "✅ Supabase loaded" : "❌ Supabase not loaded"

// Check current user
const { data } = await supabase.auth.getUser()
console.log(data) // Should show user object

// Check profiles table
const { data: profiles } = await supabase.from('profiles').select('*')
console.log(profiles) // Should show all profiles

// Check auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
})
```

---

## Need to Reset Everything?

If you want to start fresh:

### Option 1: Delete test users
- Go to Supabase Dashboard
- **Authentication > Users**
- Click each user
- Click **Delete user**

### Option 2: Clear all tables
- Go to **SQL Editor**
- Run: `TRUNCATE TABLE public.profiles CASCADE;`
- Run: `TRUNCATE TABLE public.reviews CASCADE;`

### Option 3: Start over completely
- Delete current Supabase project
- Create new project with fresh database
- Update `.env.local` with new credentials

---

## Authentication Flow Explained

Here's what happens when you sign up:

1. **User fills form** → Frontend
2. **Form submitted** → `AuthModal.tsx` calls `signUp()`
3. **Create auth user** → Supabase Auth (creates user in auth.users)
4. **Create profile** → Call `/api/auth/profile` endpoint (creates user in profiles table)
5. **Success** → Show message "Account created successfully!"

**Sign in flow:**

1. **User fills form** → Frontend
2. **Form submitted** → `AuthModal.tsx` calls `signIn()`
3. **Authenticate** → Supabase Auth verifies email/password
4. **Success** → Load user profile → Set in `AuthProvider`
5. **UI updates** → Show user in navbar

---

## Ask for Help With These Details

If authentication still doesn't work, check:

1. **What's your `.env.local` file contents?** (hide keys)
   - Does `NEXT_PUBLIC_SUPABASE_URL` look right?
   - Does `NEXT_PUBLIC_SUPABASE_ANON_KEY` look right?

2. **What error message do you see?**
   - When trying to sign up?
   - In browser console?
   - In terminal?

3. **What shows in Supabase Dashboard?**
   - Are users appearing in **Authentication > Users**?
   - Are profiles appearing in **Database > profiles**?

With these details, we can debug faster! 🚀
