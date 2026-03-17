import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, username, fullName } = await req.json()

    if (!userId || !email || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create admin client with service role for unrestricted access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Upsert profile - handles both create and update
    // Using upsert to handle the case where auto-trigger already created the profile
    const { error } = await supabaseAdmin.from('profiles').upsert(
      {
        id: userId,
        email: email,
        username: username.toLowerCase(),
        full_name: fullName || '',
        avatar_url: '',
        bio: '',
        is_critic: false,
        helpful_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        onConflict: 'id'
      }
    )

    if (error) {
      console.error('Upsert error:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create profile' },
      { status: 500 }
    )
  }
}
