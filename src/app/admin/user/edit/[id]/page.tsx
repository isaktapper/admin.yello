'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, X, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface Profile {
  id: string
  plan: 'free' | 'unlimited'
  admin?: boolean
  created_at: string
  updated_at?: string
  email?: string // From auth.users
}

export default function UserEditPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    plan: 'free' as 'free' | 'unlimited',
    admin: false,
    email: ''
  })
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
        const userEmail = emails[userId] || 'No email'

        const profileWithEmail = {
          ...profileData,
          email: userEmail
        }

        setProfile(profileWithEmail)
        setFormData({
          plan: profileData.plan,
          admin: profileData.admin || false,
          email: userEmail
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

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan: formData.plan,
          admin: formData.admin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        setError('Failed to update user profile')
        return
      }

      // If email was changed, we'd need to handle auth.users update here
      // For now, we'll show a message about email updates
      if (formData.email !== profile.email && formData.email !== 'No email') {
        alert('Note: Email updates require additional server-side configuration. Plan and admin status have been updated.')
      }

      // Redirect back to user detail page
      router.push(`/admin/user/${userId}`)
    } catch (err) {
      console.error('Error saving user:', err)
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
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
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
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
                The user you&apos;re trying to edit doesn&apos;t exist or has been deleted.
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600">Update user account settings and permissions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              User account details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Email updates require additional server configuration and will be noted but not immediately applied.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={profile.id}
                disabled
                className="font-mono text-sm bg-gray-50"
              />
              <p className="text-xs text-gray-500">User ID cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label>Account Created</Label>
              <Input
                value={format(new Date(profile.created_at), 'PPP')}
                disabled
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions & Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions & Plan</CardTitle>
            <CardDescription>
              User subscription plan and administrative privileges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: 'free' | 'unlimited') => 
                  setFormData(prev => ({ ...prev, plan: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free Plan</SelectItem>
                  <SelectItem value="unlimited">Unlimited Plan</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose the subscription plan for this user
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="admin">Administrative Access</Label>
                  <p className="text-sm text-gray-600">
                    Grant admin privileges to this user
                  </p>
                </div>
                <Switch
                  id="admin"
                  checked={formData.admin}
                  onCheckedChange={(checked: boolean) => 
                    setFormData(prev => ({ ...prev, admin: checked }))
                  }
                />
              </div>
              <p className="text-xs text-gray-500">
                Admin users can access the admin dashboard and manage other users
              </p>
            </div>

            {/* Current Status Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Current Status Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan:</span>
                  <Badge variant="outline" className="capitalize">
                    {formData.plan}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin:</span>
                  <Badge variant={formData.admin ? 'destructive' : 'outline'}>
                    {formData.admin ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Save Changes</h3>
              <p className="text-sm text-gray-600">
                Make sure to review all changes before saving
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 