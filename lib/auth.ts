import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  is_critic: boolean
  helpful_score: number
  created_at: string
}

// Simple in-memory cache with TTL (time-to-live)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

function clearCache(pattern?: string): void {
  if (pattern) {
    const keysToDelete: string[] = []
    cache.forEach((_, key) => {
      if (key.includes(pattern)) keysToDelete.push(key)
    })
    keysToDelete.forEach(key => cache.delete(key))
  } else {
    cache.clear()
  }
}

// Sign up with email + password
export async function signUp(email: string, password: string, username: string, fullName: string) {
  try {
    // Clear cache on signup
    clearCache('profile')
    clearCache('user')
    
    // 1. Create auth user with email confirmation disabled for development
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase(), full_name: fullName },
        // Skip email confirmation for development - can be enabled later in Supabase settings
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (error) {
      // Handle specific email errors
      if (error.message && error.message.includes('sending confirmation email')) {
        return { 
          user: data?.user || null, 
          error: 'Email verification is being skipped for development. You can sign in directly.' 
        }
      }
      return { user: null, error: error.message }
    }
    
    if (!data.user) return { user: null, error: 'Failed to create user' }
    
    // 2. Create profile via server endpoint (uses service role to bypass RLS)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email: email,
          username: username.toLowerCase(),
          fullName: fullName || ''
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Profile creation failed:', errorData)
        return { user: data.user, error: `Profile setup failed: ${errorData.error}` }
      }
    } catch (fetchError) {
      console.error('Error calling profile endpoint:', fetchError)
      return { user: data.user, error: 'Failed to setup user profile' }
    }
    
    return { user: data.user, error: null }
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'Unknown signup error' }
  }
}

// Sign in with email + password
export async function signIn(email: string, password: string) {
  clearCache('profile')
  clearCache('user')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: error.message }
  return { user: data.user, error: null }
}

// Sign out
export async function signOut() {
  await supabase.auth.signOut()
}

// Get current session user
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// Get full profile of current user
export async function getCurrentProfile(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // Check cache first
    const cached = getCached<AuthUser>(`profile:${user.id}`)
    if (cached) return cached
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setCache(`profile:${user.id}`, data)
    }
    return data || null
  } catch (err) {
    console.error('Error fetching current profile:', err)
    return null
  }
}

// Get profile by username
export async function getProfileByUsername(username: string): Promise<AuthUser | null> {
  const cacheKey = `profile:username:${username}`
  
  // Check cache first
  const cached = getCached<AuthUser>(cacheKey)
  if (cached) return cached
  
  try {
    const { data } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (data) {
      setCache(cacheKey, data)
    }
    return data || null
  } catch (err) {
    console.error('Error fetching profile:', err)
    return null
  }
}

// Update profile
export async function updateProfile(userId: string, updates: Partial<AuthUser>) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  return !error
}

// Check if username is taken
export async function isUsernameTaken(username: string): Promise<boolean> {
  const cacheKey = `username:taken:${username}`
  
  // Check cache first (TTL helps with validation checks)
  const cached = getCached<boolean>(cacheKey)
  if (cached !== null) return cached
  
  try {
    const { data } = await supabase.from('profiles').select('id').eq('username', username).single()
    const taken = !!data
    setCache(cacheKey, taken)
    return taken
  } catch (err) {
    console.error('Error checking username:', err)
    return false
  }
}

// Get user stats
export async function getUserStats(userId: string) {
  const [ratingsRes, reviewsRes] = await Promise.all([
    supabase.from('user_ratings').select('rating').eq('session_id', userId),
    supabase.from('reviews').select('id, rating, helpful').eq('author_name', userId)
  ])

  const ratings = ratingsRes.data || []
  const reviews = reviewsRes.data || []
  const avgRating = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : null

  return {
    totalRatings: ratings.length,
    totalReviews: reviews.length,
    avgRating,
    helpfulVotes: reviews.reduce((s, r) => s + (r.helpful || 0), 0)
  }
}

// Follow / unfollow user
export async function toggleFollow(followerId: string, followingId: string) {
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
    return false // unfollowed
  } else {
    await supabase.from('follows').insert([{ follower_id: followerId, following_id: followingId }])
    return true // followed
  }
}

// Check if following
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()
  return !!data
}

// Get follower/following counts
export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
    supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId)
  ])
  return {
    followers: followers.count || 0,
    following: following.count || 0
  }
}
