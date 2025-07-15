'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Shield, Crown, Users, Mail, Calendar, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Profile {
  id: string
  plan: 'free' | 'unlimited'
  admin?: boolean
  created_at: string
  updated_at?: string
  email?: string // From auth.users
}

export default function UserDetailPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError('User not found')
          } else {
            setError('Error loading user profile')
          }
          return
        }

        // Get email from API route
        const emailResponse = await fetch('/api/admin/users/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userIds: [userId] })
        })

        const { emails } = await emailResponse.json()

        setProfile({
          ...profileData,
          email: emails[userId] || 'No email'
        })
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('Error loading user profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId, supabase])

  const getRoleIcon = (profile: Profile) => {
    if (profile.admin) {
      return <Shield className="h-5 w-5" />
    }
    switch (profile.plan) {
      case 'unlimited':
        return <Crown className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getRoleBadgeVariant = (profile: Profile) => {
    if (profile.admin) {
      return 'destructive'
    }
    switch (profile.plan) {
      case 'unlimited':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (profile: Profile) => {
    if (profile.admin) {
      return 'admin'
    }
    return profile.plan
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg font-medium mb-2">
                {error || 'User not found'}
              </div>
              <p className="text-gray-600">
                The user you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Button onClick={() => router.push(`/admin/user/edit/${userId}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
        <p className="text-gray-600">View user account information and settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Basic account details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="text-sm">{profile.email}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User ID</span>
              <span className="text-sm font-mono text-gray-600">{profile.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <div className="text-right">
                <div className="text-sm">{format(new Date(profile.created_at), 'PPP')}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>

            {profile.updated_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <div className="text-right">
                  <div className="text-sm">{format(new Date(profile.updated_at), 'PPP')}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions & Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions & Plan
            </CardTitle>
            <CardDescription>
              User role, plan type, and administrative privileges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <Badge variant={getRoleBadgeVariant(profile)} className="flex items-center gap-1">
                {getRoleIcon(profile)}
                {getRoleLabel(profile)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan Type</span>
              <Badge variant="outline" className="capitalize">
                {profile.plan}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Admin Access</span>
              <Badge variant={profile.admin ? 'destructive' : 'outline'}>
                {profile.admin ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for this user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/user/edit/${userId}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Back to Users List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 