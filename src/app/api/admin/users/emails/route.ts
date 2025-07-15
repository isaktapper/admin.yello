import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json()

    if (!Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds must be an array' }, { status: 400 })
    }

    const emailMap: Record<string, string> = {}

    // Fetch emails for all user IDs
    for (const userId of userIds) {
      try {
        const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId)
        
        if (!error && userData.user?.email) {
          emailMap[userId] = userData.user.email
        } else {
          emailMap[userId] = 'No email'
        }
      } catch (err) {
        console.log('Error fetching email for user:', userId, err)
        emailMap[userId] = 'No email'
      }
    }

    return NextResponse.json({ emails: emailMap })
  } catch (error) {
    console.error('Error in emails API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 