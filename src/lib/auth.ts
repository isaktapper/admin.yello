import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return profile
}

export async function requireAdminAuth() {
  const user = await getAuthUser()
  
  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(user.id)
  
  if (!profile || !profile.admin) {
    redirect('/unauthorized')
  }

  return { user, profile }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
} 