import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST() {
  try {
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 })
    }

    // Get all existing profiles
    const { data: existingProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id')
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || [])
    
    // Find users missing profile records
    const missingProfiles = authUsers.users
      .filter(user => !existingProfileIds.has(user.id))
      .map(user => ({
        id: user.id,
        plan: 'free' as const,
        admin: false,
        created_at: user.created_at,
        updated_at: new Date().toISOString()
      }))

    if (missingProfiles.length === 0) {
      return NextResponse.json({ 
        message: 'All users already have profile records',
        synced: 0 
      })
    }

    // Insert missing profile records
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert(missingProfiles)

    if (insertError) {
      console.error('Error inserting profiles:', insertError)
      return NextResponse.json({ error: 'Failed to create profile records' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Successfully synced ${missingProfiles.length} user(s)`,
      synced: missingProfiles.length,
      userIds: missingProfiles.map(p => p.id)
    })
  } catch (error) {
    console.error('Error in sync-users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 