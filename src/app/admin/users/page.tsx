'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Crown, Users as UsersIcon, Shield, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Profile {
  id: string
  plan: 'free' | 'unlimited'
  admin?: boolean
  created_at: string
  updated_at?: string
  email?: string // From auth.users
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const router = useRouter()
  const supabase = createClient()

  const syncMissingUsers = async () => {
    try {
      const response = await fetch('/api/admin/sync-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error syncing users:', error)
      return null
    }
  }

  const fetchProfiles = useCallback(async () => {
    try {
      // Get profiles from API route (bypasses RLS)
      const profilesResponse = await fetch('/api/admin/profiles')
      
      if (!profilesResponse.ok) {
        console.error('Error fetching profiles:', profilesResponse.status, profilesResponse.statusText)
        return
      }

      const { profiles: profilesData } = await profilesResponse.json()
      const typedProfiles = profilesData as Profile[]

      if (!typedProfiles?.length) {
        setProfiles([])
        return
      }

      // Get all user IDs
      const userIds = typedProfiles.map((profile: Profile) => profile.id)
      
      // Fetch emails from API route
      const emailResponse = await fetch('/api/admin/users/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds })
      })

      if (!emailResponse.ok) {
        console.error('Email fetch failed:', emailResponse.status, emailResponse.statusText)
      }

      const emailData = await emailResponse.json()
      const { emails } = emailData

      // Combine profiles with emails and ensure default values
      const profilesWithEmail = typedProfiles.map((profile: Profile) => ({
        ...profile,
        plan: profile.plan || 'free', // Default to 'free' if null/undefined
        admin: profile.admin || false, // Default to false if null/undefined
        email: emails[profile.id] || 'No email'
      }))

      setProfiles(profilesWithEmail)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      await syncMissingUsers()
      // Always refresh profiles after syncing, regardless of sync count
      await fetchProfiles()
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const updateUserPlan = async (userId: string, newPlan: 'free' | 'unlimited') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: newPlan, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user plan:', error)
        return
      }

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId 
          ? { ...profile, plan: newPlan, updated_at: new Date().toISOString() }
          : profile
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ admin: isAdmin, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        console.error('Error updating admin status:', error)
        return
      }

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId 
          ? { ...profile, admin: isAdmin, updated_at: new Date().toISOString() }
          : profile
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Ensure we handle null/undefined values properly
    const userPlan = profile.plan || 'free'
    const isAdmin = profile.admin || false
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'admin' && isAdmin) ||
      (roleFilter !== 'admin' && userPlan === roleFilter)

    return matchesSearch && matchesRole
  })

  const getRoleIcon = (profile: Profile) => {
    if (profile.admin) {
      return <Shield className="h-4 w-4" />
    }
    switch (profile.plan) {
      case 'unlimited':
        return <Crown className="h-4 w-4" />
      default:
        return <UsersIcon className="h-4 w-4" />
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleManualSync}
            disabled={syncing || loading}
            className="bg-blue-50 border-blue-200 hover:bg-blue-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Users'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredProfiles.length})</CardTitle>
          <CardDescription>
            View and manage user plans and admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="free">Free Plan</SelectItem>
                <SelectItem value="unlimited">Unlimited Plan</SelectItem>
                <SelectItem value="admin">Admin Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow 
                    key={profile.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/admin/user/${profile.id}`)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{profile.email || 'No email'}</div>
                        <div className="text-sm text-gray-500">{profile.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(profile)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(profile)}
                        {getRoleLabel(profile)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {profile.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.admin ? 'destructive' : 'outline'}>
                        {profile.admin ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={profile.plan}
                          onValueChange={(newPlan: 'free' | 'unlimited') => 
                            updateUserPlan(profile.id, newPlan)
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant={profile.admin ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => toggleAdminStatus(profile.id, !profile.admin)}
                        >
                          {profile.admin ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 