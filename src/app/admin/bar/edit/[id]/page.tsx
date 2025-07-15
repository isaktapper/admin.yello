'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, X, Eye } from 'lucide-react'
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
  user_email?: string
}

export default function BarEditPage() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    icon: '',
    background: '#000000',
    background_gradient: '',
    text_color: '#ffffff',
    visibility: true,
    slug: '',
    is_sticky: false,
    title_font_size: 16,
    message_font_size: 14,
    title_url: '',
    message_url: '',
    text_alignment: 'left',
    icon_alignment: 'right',
    is_closable: true,
    type: 'banner',
    bar_height: 60,
    use_gradient: false,
    font_family: '',
    geo_countries: [] as string[],
    page_paths: [] as string[],
    scheduled_start: '',
    scheduled_end: ''
  })
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

        const announcementWithEmail = {
          ...announcementData,
          user_email: userEmail
        }

        setAnnouncement(announcementWithEmail)
        setFormData({
          title: announcementData.title || '',
          message: announcementData.message || '',
          icon: announcementData.icon || '',
          background: announcementData.background || '#000000',
          background_gradient: announcementData.background_gradient || '',
          text_color: announcementData.text_color || '#ffffff',
          visibility: announcementData.visibility ?? true,
          slug: announcementData.slug || '',
          is_sticky: announcementData.is_sticky ?? false,
          title_font_size: announcementData.title_font_size || 16,
          message_font_size: announcementData.message_font_size || 14,
          title_url: announcementData.title_url || '',
          message_url: announcementData.message_url || '',
          text_alignment: announcementData.text_alignment || 'left',
          icon_alignment: announcementData.icon_alignment || 'right',
          is_closable: announcementData.is_closable ?? true,
          type: announcementData.type || 'banner',
          bar_height: announcementData.bar_height || 60,
          use_gradient: announcementData.use_gradient ?? false,
          font_family: announcementData.font_family || '',
          geo_countries: announcementData.geo_countries || [],
          page_paths: announcementData.page_paths || [],
          scheduled_start: announcementData.scheduled_start ? 
            new Date(announcementData.scheduled_start).toISOString().slice(0, 16) : '',
          scheduled_end: announcementData.scheduled_end ? 
            new Date(announcementData.scheduled_end).toISOString().slice(0, 16) : ''
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

  const handleSave = async () => {
    if (!announcement) return

    setSaving(true)
    try {
      // Prepare update data
      const updateData = {
        title: formData.title,
        message: formData.message,
        icon: formData.icon || null,
        background: formData.background,
        background_gradient: formData.background_gradient || null,
        text_color: formData.text_color,
        visibility: formData.visibility,
        slug: formData.slug,
        is_sticky: formData.is_sticky,
        title_font_size: formData.title_font_size,
        message_font_size: formData.message_font_size,
        title_url: formData.title_url || null,
        message_url: formData.message_url || null,
        text_alignment: formData.text_alignment,
        icon_alignment: formData.icon_alignment,
        is_closable: formData.is_closable,
        type: formData.type,
        bar_height: formData.bar_height,
        use_gradient: formData.use_gradient,
        font_family: formData.font_family || null,
        geo_countries: formData.geo_countries.length > 0 ? formData.geo_countries : null,
        page_paths: formData.page_paths.length > 0 ? formData.page_paths : null,
        scheduled_start: formData.scheduled_start ? new Date(formData.scheduled_start).toISOString() : null,
        scheduled_end: formData.scheduled_end ? new Date(formData.scheduled_end).toISOString() : null
      }

      // Update announcement in database
      const { error: updateError } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', announcementId)

      if (updateError) {
        console.error('Error updating announcement:', updateError)
        setError('Failed to update announcement')
        return
      }

      // Redirect back to announcement detail page
      router.push(`/admin/bar/${announcementId}`)
    } catch (err) {
      console.error('Error saving announcement:', err)
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayInput = (field: 'geo_countries' | 'page_paths', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean)
    updateFormData(field, array)
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Announcement</h1>
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
                The announcement you&apos;re trying to edit doesn&apos;t exist or has been deleted.
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Announcement</h1>
        <p className="text-gray-600">Update announcement content and settings</p>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            See how your announcement will appear to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="rounded-lg border p-4 min-h-16 flex items-center"
            style={{
              backgroundColor: formData.use_gradient && formData.background_gradient 
                ? formData.background_gradient 
                : formData.background,
              color: formData.text_color,
              fontFamily: formData.font_family || 'inherit',
              height: formData.bar_height ? `${formData.bar_height}px` : 'auto',
              textAlign: (formData.text_alignment as React.CSSProperties['textAlign']) || 'left'
            }}
          >
            <div className="flex-1">
              <div 
                className="font-medium"
                style={{ fontSize: `${formData.title_font_size}px` }}
              >
                {formData.title || 'Your title here...'}
              </div>
              <div 
                className="text-sm opacity-90"
                style={{ fontSize: `${formData.message_font_size}px` }}
              >
                {formData.message || 'Your message here...'}
              </div>
            </div>
            {formData.icon && (
              <div className="ml-4">
                {formData.icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Content */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Content</CardTitle>
            <CardDescription>
              Main announcement text and basic settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter announcement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                placeholder="Enter announcement message"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => updateFormData('slug', e.target.value)}
                placeholder="announcement-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => updateFormData('icon', e.target.value)}
                placeholder="🎉 or emoji/icon"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Styling */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Styling</CardTitle>
            <CardDescription>
              Colors, fonts, and visual appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="background">Background Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.background}
                    onChange={(e) => updateFormData('background', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={formData.background}
                    onChange={(e) => updateFormData('background', e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color">Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => updateFormData('text_color', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={formData.text_color}
                    onChange={(e) => updateFormData('text_color', e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use_gradient">Use Gradient Background</Label>
                <Switch
                  id="use_gradient"
                  checked={formData.use_gradient}
                  onCheckedChange={(checked: boolean) => updateFormData('use_gradient', checked)}
                />
              </div>
            </div>

            {formData.use_gradient && (
              <div className="space-y-2">
                <Label htmlFor="background_gradient">Gradient CSS</Label>
                <Input
                  id="background_gradient"
                  value={formData.background_gradient}
                  onChange={(e) => updateFormData('background_gradient', e.target.value)}
                  placeholder="linear-gradient(90deg, #ff0000, #0000ff)"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="font_family">Font Family</Label>
              <Select value={formData.font_family || 'default'} onValueChange={(value) => updateFormData('font_family', value === 'default' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title_font_size">Title Font Size (px)</Label>
                <Input
                  id="title_font_size"
                  type="number"
                  value={formData.title_font_size}
                  onChange={(e) => updateFormData('title_font_size', parseInt(e.target.value) || 16)}
                  min="8"
                  max="48"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message_font_size">Message Font Size (px)</Label>
                <Input
                  id="message_font_size"
                  type="number"
                  value={formData.message_font_size}
                  onChange={(e) => updateFormData('message_font_size', parseInt(e.target.value) || 14)}
                  min="8"
                  max="32"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bar_height">Bar Height (px)</Label>
              <Input
                id="bar_height"
                type="number"
                value={formData.bar_height}
                onChange={(e) => updateFormData('bar_height', parseInt(e.target.value) || 60)}
                min="40"
                max="200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Layout & Behavior */}
        <Card>
          <CardHeader>
            <CardTitle>Layout & Behavior</CardTitle>
            <CardDescription>
              Display behavior and positioning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text_alignment">Text Alignment</Label>
              <Select value={formData.text_alignment} onValueChange={(value) => updateFormData('text_alignment', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon_alignment">Icon Alignment</Label>
              <Select value={formData.icon_alignment} onValueChange={(value) => updateFormData('icon_alignment', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="visibility">Visible</Label>
                  <p className="text-sm text-gray-600">Show this announcement to users</p>
                </div>
                <Switch
                  id="visibility"
                  checked={formData.visibility}
                  onCheckedChange={(checked: boolean) => updateFormData('visibility', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_sticky">Sticky</Label>
                  <p className="text-sm text-gray-600">Keep announcement visible while scrolling</p>
                </div>
                <Switch
                  id="is_sticky"
                  checked={formData.is_sticky}
                  onCheckedChange={(checked: boolean) => updateFormData('is_sticky', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_closable">Closable</Label>
                  <p className="text-sm text-gray-600">Allow users to close this announcement</p>
                </div>
                <Switch
                  id="is_closable"
                  checked={formData.is_closable}
                  onCheckedChange={(checked: boolean) => updateFormData('is_closable', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_url">Title URL (optional)</Label>
              <Input
                id="title_url"
                type="url"
                value={formData.title_url}
                onChange={(e) => updateFormData('title_url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message_url">Message URL (optional)</Label>
              <Input
                id="message_url"
                type="url"
                value={formData.message_url}
                onChange={(e) => updateFormData('message_url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Targeting & Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Targeting & Scheduling</CardTitle>
            <CardDescription>
              Control when and where the announcement appears
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_start">Scheduled Start (optional)</Label>
              <Input
                id="scheduled_start"
                type="datetime-local"
                value={formData.scheduled_start}
                onChange={(e) => updateFormData('scheduled_start', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_end">Scheduled End (optional)</Label>
              <Input
                id="scheduled_end"
                type="datetime-local"
                value={formData.scheduled_end}
                onChange={(e) => updateFormData('scheduled_end', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="geo_countries">Target Countries</Label>
              <Input
                id="geo_countries"
                value={formData.geo_countries.join(', ')}
                onChange={(e) => handleArrayInput('geo_countries', e.target.value)}
                placeholder="US, CA, GB (comma-separated)"
              />
              <p className="text-xs text-gray-500">
                Leave empty to show to all countries
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="page_paths">Target Page Paths</Label>
              <Textarea
                id="page_paths"
                value={formData.page_paths.join(', ')}
                onChange={(e) => handleArrayInput('page_paths', e.target.value)}
                placeholder="/home, /about, /products (comma-separated)"
                rows={2}
              />
              <p className="text-xs text-gray-500">
                Leave empty to show on all pages
              </p>
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
                Review your changes and save the announcement
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