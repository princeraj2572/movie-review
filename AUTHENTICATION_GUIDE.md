# How Cinescope Authentication Works - Complete Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CINESCOPE APP                           │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────▼─────┐      ┌─────▼──────┐
              │ Frontend   │      │  Backend   │
              │ Components │      │  API       │
              └─────┬─────┘      └─────┬──────┘
                    │                   │
        ┌───────────┼───────────────────┼────────┐
        │           │                   │        │
    Auth Modal   Auth Provider    Profile    TMDB
    Sign In/Up    useAuth()       Endpoint   API
        │           │                   │        │
        └───────────┼───────────────────┼────────┤
                    │                   │        │
              ┌─────▼───────────────────▼────────▼──┐
              │  SUPABASE                           │
              ├─────────────────────────────────────┤
              │ • Auth Service   (Email/Password)   │
              │ • Postgres DB    (Tables)           │
              │ • RLS Policies   (Security)         │
              └─────────────────────────────────────┘
```

---

## 1️⃣ Sign Up Flow

### What happens when user clicks "Create Account":

```
User fills form
    │
    ├─ Email: user@example.com
    ├─ Username: john_doe
    ├─ Password: SecurePass123
    └─ Full Name: John Doe
        │
        ▼
    AuthModal.tsx calls signUp()
        │
        ▼
    lib/auth.ts:signUp() function
        │
        ├─ Step 1: Create auth user in Supabase Auth
        │   └─ supabase.auth.signUp(email, password, metadata)
        │       └─ Returns: { user: AuthUser, error: null }
        │
        ├─ Step 2: Create profile in profiles table
        │   └─ Calls /api/auth/profile endpoint
        │       └─ Endpoint creates profile with service role key
        │           └─ Returns: { success: true }
        │
        └─ Step 3: Return result to UI
            └─ Show: "Account created! Check email & sign in"

User sees success message ✅
```

**Files involved:**
- `components/auth/AuthModal.tsx` - UI form
- `lib/auth.ts` - `signUp()` function
- `app/api/auth/profile/route.ts` - Backend profile creation
- Supabase: `auth.users` table, `profiles` table

---

## 2️⃣ Sign In Flow

### What happens when user clicks "Sign In":

```
User fills form
    │
    ├─ Email: user@example.com
    └─ Password: SecurePass123
        │
        ▼
    AuthModal.tsx calls signIn()
        │
        ▼
    lib/auth.ts:signIn() function
        │
        ├─ Step 1: Authenticate with Supabase
        │   └─ supabase.auth.signInWithPassword(email, password)
        │       └─ Returns: { user: AuthUser, error: null }
        │
        ├─ Step 2: Update AuthProvider context
        │   └─ Call refresh() function
        │       └─ Loads user profile from database
        │
        └─ Step 3: Close modal & redirect
            └─ User menu appears in navbar

User menu shows username ✅
```

**Files involved:**
- `components/auth/AuthModal.tsx` - UI form
- `lib/auth.ts` - `signIn()` function
- `components/auth/AuthProvider.tsx` - Updates app state
- Supabase: `auth.users` table

---

## 3️⃣ Session Management

### How the app knows if user is logged in:

```
Page loads
    │
    ▼
AuthProvider.tsx initializes
    │
    ├─ useEffect runs on mount
    │   └─ Calls loadUser() function
    │       │
    │       ├─ Check: Is user logged in?
    │       │   └─ supabase.auth.getUser()
    │       │
    │       ├─ If YES:
    │       │   └─ Fetch profile from database
    │       │       └─ Set in Context: user = profile data
    │       │
    │       └─ If NO:
    │           └─ Set in Context: user = null
    │
    └─ Listen for auth changes
        └─ supabase.auth.onAuthStateChange()
            └─ If user signs in/out anywhere
                └─ Call loadUser() again
                    └─ Context updates
                        └─ All components using useAuth() re-render

Navbar re-renders ✅
User menu shows/hides ✅
```

**Files involved:**
- `components/auth/AuthProvider.tsx` - Session listener
- `lib/auth.ts` - `getCurrentProfile()` function
- `components/Navbar.tsx` - Uses `useAuth()` hook
- `components/auth/UserMenu.tsx` - Displays user info

---

## 4️⃣ Authentication State in Context

### How useAuth() hook works:

```tsx
// In any component:
import { useAuth } from "@/components/auth/AuthProvider"

export function MyComponent() {
  const { user, loading, refresh } = useAuth()
  
  // user = {
  //   id: "uuid",
  //   email: "user@example.com",
  //   username: "john_doe",
  //   full_name: "John Doe",
  //   avatar_url: "",
  //   bio: "",
  //   is_critic: false,
  //   helpful_score: 0,
  //   created_at: "2024-01-01T..."
  // }
  
  // loading = true/false (while checking session)
  
  // refresh = function to reload user data
  
  if (loading) return <div>Loading...</div>
  
  if (!user) {
    return <div>Not logged in</div>
  }
  
  return <div>Welcome {user.username}!</div>
}
```

---

## 5️⃣ Database Schema

### Tables created for authentication:

```sql
┌──────────────────────────────────────┐
│ auth.users (Supabase managed)        │
├──────────────────────────────────────┤
│ • id (UUID)                          │
│ • email                              │
│ • encrypted_password                 │
│ • email_confirmed_at                 │
│ • created_at, updated_at             │
└──────────────────────────────────────┘
           │ (references)
           │
┌──────────────────────────────────────┐
│ profiles (Our table)                 │
├──────────────────────────────────────┤
│ • id (UUID, FK to auth.users)        │ ← Links to auth user
│ • email                              │
│ • username (unique)                  │
│ • full_name                          │
│ • avatar_url                         │
│ • bio                                │
│ • is_critic                          │
│ • helpful_score                      │
│ • created_at                         │
│ • updated_at                         │
└──────────────────────────────────────┘
           │ (referenced by)
           │
    ┌──────┼──────┬──────────┬──────────┐
    │      │      │          │          │
┌───▼──┐ ┌─▼──┐ ┌─▼───┐ ┌──▼──┐ ┌─────▼─┐
│reviews│ │follow
s│ │watchlist│ │ratings│ │comments│
└───────┘ └──────┘ └──────┘ └────────┘ └────────┘
```

---

## 6️⃣ Security Features

### Row Level Security (RLS) Policies:

```
┌─────────────────────────────────────────┐
│ profiles table RLS                      │
├─────────────────────────────────────────┤
│ SELECT: Everyone can read any profile   │
│ INSERT: Only user can create their own  │
│ UPDATE: Only user can update their own  │
│ DELETE: Only user can delete their own  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ reviews table RLS                       │
├─────────────────────────────────────────┤
│ SELECT: Everyone can read all reviews   │
│ INSERT: Any logged-in user can create   │
│ UPDATE: Only author can edit their own  │
│ DELETE: Only author can delete their own│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ watchlist table RLS                     │
├─────────────────────────────────────────┤
│ SELECT: Only user can see their own     │
│ INSERT: Only user can add to theirs     │
│ UPDATE: Not allowed                     │
│ DELETE: Only user can remove from theirs│
└─────────────────────────────────────────┘
```

**Why this matters:**
- Users can't see other users' private data
- Users can only modify their own content
- Prevents hacking/data tampering
- Enforced at database level (not just frontend)

---

## 7️⃣ File Organization

```
cinescope/
│
├── 🔐 Authentication Files
│   ├── lib/auth.ts
│   │   └─ signUp(email, password, username, fullName)
│   │   └─ signIn(email, password)
│   │   └─ signOut()
│   │   └─ getCurrentProfile()
│   │   └─ getProfileByUsername(username)
│   │   └─ updateProfile(userId, updates)
│   │   └─ User stats, follows, etc.
│   │
│   ├── lib/supabase.ts
│   │   └─ Supabase client setup
│   │   └─ Uses: NEXT_PUBLIC_SUPABASE_URL
│   │   └─ Uses: NEXT_PUBLIC_SUPABASE_ANON_KEY
│   │
│   ├── components/auth/AuthProvider.tsx
│   │   └─ Context provider for auth state
│   │   └─ Listens to auth changes
│   │   └─ useAuth() hook to access user
│   │
│   ├── components/auth/AuthModal.tsx
│   │   └─ Sign in / Sign up form UI
│   │   └─ Form validation
│   │   └─ Error handling
│   │
│   ├── components/auth/UserMenu.tsx
│   │   └─ Dropdown menu with user options
│   │   └─ Shows when logged in
│   │
│   └── app/api/auth/profile/route.ts
│       └─ Server endpoint to create profile
│       └─ Uses: SUPABASE_SERVICE_ROLE_KEY
│       └─ Bypasses RLS to create initial profile
│
├── 📄 Configuration
│   ├── .env.local
│   │   └─ NEXT_PUBLIC_SUPABASE_URL
│   │   └─ NEXT_PUBLIC_SUPABASE_ANON_KEY
│   │   └─ SUPABASE_SERVICE_ROLE_KEY
│   │   └─ NEXT_PUBLIC_TMDB_API_KEY
│   │
│   └── next.config.js
│       └─ Next.js configuration
│
└── 📚 Documentation
    ├── AUTHENTICATION_SETUP.md
    │   └─ Step-by-step setup guide
    │
    ├── AUTHENTICATION_TROUBLESHOOTING.md
    │   └─ Common issues & fixes
    │
    └── AUTHENTICATION_GUIDE.md (this file)
        └─ How everything works
```

---

## 8️⃣ Common Operations

### Get current user:
```typescript
import { useAuth } from "@/components/auth/AuthProvider"

export function MyComponent() {
  const { user } = useAuth()
  
  if (user) {
    console.log(user.email)      // user@example.com
    console.log(user.username)   // john_doe
    console.log(user.id)         // uuid-string
  }
}
```

### Sign out:
```typescript
import { signOut } from "@/lib/auth"

async function handleSignOut() {
  await signOut()
  // Redirect happens automatically via AuthProvider
}
```

### Check if user can edit:
```typescript
import { useAuth } from "@/components/auth/AuthProvider"

export function ReviewEditor({ authorId }) {
  const { user } = useAuth()
  const canEdit = user?.id === authorId
  
  if (canEdit) {
    return <button>Edit Review</button>
  }
}
```

### Get user profile:
```typescript
import { getProfileByUsername } from "@/lib/auth"

async function loadUserProfile(username) {
  const profile = await getProfileByUsername(username)
  console.log(profile.bio)      // User's bio
  console.log(profile.reviews)  // Count of reviews
}
```

---

## 9️⃣ Environment Variables Explained

| Variable | Purpose | Visibility | Where from |
|----------|---------|------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Connect to Supabase | Public (browser) | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Authenticate requests | Public (browser) | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side access | Private (backend only) | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_TMDB_API_KEY` | Access TMDB API | Public (browser) | TMDB Website |

**Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code!

---

## 🔟 Authentication Lifecycle

```
APP START
    │
    ├─ AuthProvider initializes
    │   └─ Checks: Is there a session?
    │       ├─ YES: Load user profile, show user menu
    │       └─ NO: Don't show user menu, show Sign In button
    │
    ├─ User clicks Sign In button
    │   └─ AuthModal opens
    │       ├─ User fills email/password
    │       ├─ Clicks Sign In
    │       └─ Supabase authenticates
    │           ├─ SUCCESS: AuthProvider refreshes, user menu appears
    │           └─ FAILURE: Show error message
    │
    ├─ User clicks Sign Out
    │   └─ Session cleared
    │       └─ AuthProvider updates
    │           └─ User menu hides, Sign In button appears
    │
    ├─ Page refresh
    │   └─ AuthProvider re-initialization
    │       └─ Session persists (browser local storage)
    │           └─ User stays logged in
    │
    └─ Browser/Tab close & re-open
        └─ AuthProvider loads previous session
            └─ User still logged in ✅
```

---

## Troubleshooting Quick Links

- **Can't sign up?** → See AUTHENTICATION_TROUBLESHOOTING.md - Issue 1
- **Can't sign in?** → See AUTHENTICATION_TROUBLESHOOTING.md - Issue 2
- **Profile not created?** → See AUTHENTICATION_TROUBLESHOOTING.md - Issue 5
- **User menu missing?** → See AUTHENTICATION_TROUBLESHOOTING.md - Issue 6
- **Need full setup?** → See AUTHENTICATION_SETUP.md

---

## What's Next?

After authentication works, you can:

1. ✅ **User Profiles** - Show user details page
2. ✅ **Movie Ratings** - Let users rate movies
3. ✅ **Reviews** - Let users write reviews
4. ✅ **Watchlist** - Let users save movies to watch
5. ✅ **Following** - Let users follow other users
6. ✅ **Comments** - Let users comment on reviews

All the database infrastructure is ready! 🚀

---

Good luck! 🎬
