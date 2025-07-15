'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Megaphone, Calendar, Eye, EyeOff, Type, Palette, Settings, Globe, Clock } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { Json } from '@/lib/supabase/types'

interface Announcement {
  id: string
  user_id?: string
  title: string
  message: string
  icon?: string
  background: string
  background_gradient?: string
  text_color: string
  visibility: boolean
  slug: string
  created_at?: string
  is_sticky: boolean
  title_font_size: number
  message_font_size: number
  title_url?: string
  message_url?: string
  text_alignment: string
  icon_alignment: string
  is_closable: boolean
  type: string
  type_settings?: Json
  content?: Json
  bar_height?: number
  use_gradient?: boolean
  font_family?: string
  geo_countries?: string[]
  page_paths?: string[]
  scheduled_start?: string
  scheduled_end?: string
  user_email?: string // From auth join
}

export default function BarDetailPage() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const announcementId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // Get announcement data
        const { data: announcementData, error: announcementError } = await supabase
          .from('announcements')
          .select('*')
          .eq('id', announcementId)
          .single()

        if (announcementError) {
          if (announcementError.code === 'PGRST116') {
            setError('Announcement not found')
          } else {
            setError('Error loading announcement')
          }
          return
        }

        // Get user email if user_id exists
        let userEmail = 'Unknown user'
        if (announcementData.user_id) {
          try {
            const emailResponse = await fetch('/api/admin/users/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userIds: [announcementData.user_id] })
            })
            const { emails } = await emailResponse.json()
            userEmail = emails[announcementData.user_id] || 'No email'
          } catch (err) {
            console.log('Could not fetch user email:', err)
          }
        }

        setAnnouncement({
          ...announcementData,
          user_email: userEmail
        })
      } catch (err) {
        console.error('Error fetching announcement:', err)
        setError('Error loading announcement')
      } finally {
        setLoading(false)
      }
    }

    if (announcementId) {
      fetchAnnouncement()
    }
  }, [announcementId, supabase])

  const getAnnouncementStatus = (announcement: Announcement): 'active' | 'scheduled' | 'inactive' => {
    if (!announcement.visibility) return 'inactive'
    
    const now = new Date()
    if (announcement.scheduled_start && new Date(announcement.scheduled_start) > now) {
      return 'scheduled'
    }
    if (announcement.scheduled_end && new Date(announcement.scheduled_end) < now) {
      return 'inactive'
    }
    
    return 'active'
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'scheduled':
        return 'secondary'
      case 'inactive':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Megaphone className="h-4 w-4" />
      case 'scheduled':
        return <Calendar className="h-4 w-4" />
      default:
        return null
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Announcement Details</h1>
          <p className="text-gray-600">Loading announcement information...</p>
        </div>
      </div>
    )
  }

  if (error || !announcement) {
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
                {error || 'Announcement not found'}
              </div>
              <p className="text-gray-600">
                The announcement you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = getAnnouncementStatus(announcement)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Button onClick={() => router.push(`/admin/bar/edit/${announcementId}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Announcement
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcement Details</h1>
        <p className="text-gray-600">View announcement content and settings</p>
      </div>

      {/* Preview Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            How this announcement appears to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="rounded-lg border p-4 min-h-16 flex items-center"
            style={{
              backgroundColor: announcement.use_gradient && announcement.background_gradient 
                ? announcement.background_gradient 
                : announcement.background,
              color: announcement.text_color,
              fontFamily: announcement.font_family || 'inherit',
              height: announcement.bar_height ? `${announcement.bar_height}px` : 'auto',
              textAlign: (announcement.text_alignment as React.CSSProperties['textAlign']) || 'left'
            }}
          >
            <div className="flex-1">
              <div 
                className="font-medium"
                style={{ fontSize: `${announcement.title_font_size}px` }}
              >
                {announcement.title}
              </div>
              <div 
                className="text-sm opacity-90"
                style={{ fontSize: `${announcement.message_font_size}px` }}
              >
                {announcement.message}
              </div>
            </div>
            {announcement.icon && (
              <div className="ml-4">
                {announcement.icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core announcement content and metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Title</span>
              <span className="text-sm">{announcement.title}</span>
            </div>
            
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Message</span>
              <span className="text-sm text-right max-w-xs">{announcement.message}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={getStatusBadgeVariant(status)} className="flex items-center gap-1">
                {getStatusIcon(status)}
                {status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Visibility</span>
              <Badge variant={announcement.visibility ? 'default' : 'outline'}>
                <div className="flex items-center gap-1">
                  {announcement.visibility ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {announcement.visibility ? 'Visible' : 'Hidden'}
                </div>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Slug</span>
              <span className="text-sm font-mono text-gray-600">{announcement.slug}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type</span>
              <Badge variant="outline" className="capitalize">
                {announcement.type}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Created By</span>
              <span className="text-sm">{announcement.user_email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Styling & Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Styling & Layout
            </CardTitle>
            <CardDescription>
              Visual appearance and layout settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Background</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: announcement.background }}
                />
                <span className="text-sm font-mono">{announcement.background}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Text Color</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: announcement.text_color }}
                />
                <span className="text-sm font-mono">{announcement.text_color}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Font Family</span>
              <span className="text-sm">{announcement.font_family || 'Default'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Title Font Size</span>
              <span className="text-sm">{announcement.title_font_size}px</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Message Font Size</span>
              <span className="text-sm">{announcement.message_font_size}px</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Text Alignment</span>
              <Badge variant="outline" className="capitalize">
                {announcement.text_alignment}
              </Badge>
            </div>

            {announcement.bar_height && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bar Height</span>
                <span className="text-sm">{announcement.bar_height}px</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Use Gradient</span>
              <Badge variant={announcement.use_gradient ? 'default' : 'outline'}>
                {announcement.use_gradient ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Behavior Settings
            </CardTitle>
            <CardDescription>
              Display behavior and interaction settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sticky</span>
              <Badge variant={announcement.is_sticky ? 'default' : 'outline'}>
                {announcement.is_sticky ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Closable</span>
              <Badge variant={announcement.is_closable ? 'default' : 'outline'}>
                {announcement.is_closable ? 'Yes' : 'No'}
              </Badge>
            </div>

            {announcement.title_url && (
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium">Title URL</span>
                <span className="text-sm text-right max-w-xs break-all">{announcement.title_url}</span>
              </div>
            )}

            {announcement.message_url && (
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium">Message URL</span>
                <span className="text-sm text-right max-w-xs break-all">{announcement.message_url}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Icon Alignment</span>
              <Badge variant="outline" className="capitalize">
                {announcement.icon_alignment}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Targeting & Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Targeting & Scheduling
            </CardTitle>
            <CardDescription>
              Geographic and temporal targeting settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcement.geo_countries && announcement.geo_countries.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium">Countries</span>
                <div className="text-right">
                  {announcement.geo_countries.map(country => (
                    <Badge key={country} variant="outline" className="mr-1 mb-1">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {announcement.page_paths && announcement.page_paths.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium">Page Paths</span>
                <div className="text-right max-w-xs">
                  {announcement.page_paths.map(path => (
                    <Badge key={path} variant="outline" className="mr-1 mb-1 font-mono text-xs">
                      {path}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {announcement.scheduled_start && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Scheduled Start</span>
                </div>
                <div className="text-right">
                  <div className="text-sm">{format(new Date(announcement.scheduled_start), 'PPP')}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(announcement.scheduled_start), 'HH:mm')}
                  </div>
                </div>
              </div>
            )}

            {announcement.scheduled_end && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Scheduled End</span>
                </div>
                <div className="text-right">
                  <div className="text-sm">{format(new Date(announcement.scheduled_end), 'PPP')}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(announcement.scheduled_end), 'HH:mm')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <div className="text-right">
                {announcement.created_at && (
                  <>
                    <div className="text-sm">{format(new Date(announcement.created_at), 'PPP')}</div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for this announcement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/bar/edit/${announcementId}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/admin/bars')}
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Back to Announcements
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 