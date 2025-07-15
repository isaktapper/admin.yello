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
import { Search, Megaphone, Calendar } from 'lucide-react'
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
  user_email?: string // From profiles join
}

export default function BarsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const router = useRouter()
  const supabase = createClient()

  // Helper function to determine announcement status
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

  const fetchAnnouncements = useCallback(async () => {
    try {
      // Get announcements first
      const { data: announcements, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching announcements:', error)
        return
      }

      if (!announcements?.length) {
        setAnnouncements([])
        return
      }

      // Get unique user IDs from announcements
      const userIds = [...new Set(announcements
        .map(announcement => announcement.user_id)
        .filter(Boolean)
      )] as string[]

      let emails: Record<string, string> = {}

      if (userIds.length > 0) {
        try {
          // Fetch emails from API route
          const emailResponse = await fetch('/api/admin/users/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds })
          })

          const emailData = await emailResponse.json()
          emails = emailData.emails || {}
        } catch (err) {
          console.log('Could not fetch user emails:', err)
        }
      }

      // Combine announcements with emails
      const announcementsWithEmails = announcements.map(announcement => ({
        ...announcement,
        user_email: announcement.user_id ? (emails[announcement.user_id] || 'No email') : 'Unknown user'
      }))

      setAnnouncements(announcementsWithEmails)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const updateAnnouncementVisibility = async (
    announcementId: string, 
    newVisibility: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ visibility: newVisibility })
        .eq('id', announcementId)

      if (error) {
        console.error('Error updating announcement visibility:', error)
        return
      }

      // Update local state
      setAnnouncements(announcements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, visibility: newVisibility }
          : announcement
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = !searchTerm || 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const announcementStatus = getAnnouncementStatus(announcement)
    const matchesStatus = statusFilter === 'all' || announcementStatus === statusFilter

    return matchesSearch && matchesStatus
  })

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bars</h1>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bars</h1>
        <p className="text-gray-600">Manage announcements and banners</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements ({filteredAnnouncements.length})</CardTitle>
          <CardDescription>
            View and manage announcement status and visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => {
                  const status = getAnnouncementStatus(announcement)
                  return (
                    <TableRow 
                      key={announcement.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/admin/bar/${announcement.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{announcement.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {announcement.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(status)} 
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(status)}
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{announcement.user_email}</div>
                      </TableCell>
                      <TableCell>
                        {announcement.scheduled_start ? (
                          <div className="text-sm">
                            {format(new Date(announcement.scheduled_start), 'MMM dd, yyyy')}
                            <div className="text-xs text-gray-500">
                              {format(new Date(announcement.scheduled_start), 'HH:mm')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {announcement.created_at && formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant={announcement.visibility ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateAnnouncementVisibility(announcement.id, !announcement.visibility)}
                          >
                            {announcement.visibility ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredAnnouncements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No announcements found matching your criteria.
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