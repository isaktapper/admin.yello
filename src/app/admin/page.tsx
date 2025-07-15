import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Crown, Megaphone, Calendar } from 'lucide-react'

async function getDashboardStats() {
  const supabase = createAdminClient()

  // Get total users count
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Get free vs unlimited users
  const { count: freeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'free')

  const { count: unlimitedUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'unlimited')

  // Get visible announcements (active ones)
  const { count: activeAnnouncements } = await supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })
    .eq('visibility', true)

  // Get scheduled announcements for next 24h
  const now = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { count: scheduledAnnouncements } = await supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', now.toISOString())
    .lte('scheduled_start', tomorrow.toISOString())

  return {
    totalUsers: totalUsers || 0,
    freeUsers: freeUsers || 0,
    unlimitedUsers: unlimitedUsers || 0,
    activeAnnouncements: activeAnnouncements || 0,
    scheduledAnnouncements: scheduledAnnouncements || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered users',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Free Users',
      value: stats.freeUsers,
      description: 'Users on free plan',
      icon: Users,
      color: 'text-gray-600',
    },
    {
      title: 'Unlimited Users',
      value: stats.unlimitedUsers,
      description: 'Users on unlimited plan',
      icon: Crown,
      color: 'text-yellow-600',
    },
    {
      title: 'Visible Banners',
      value: stats.activeAnnouncements,
      description: 'Currently visible',
      icon: Megaphone,
      color: 'text-green-600',
    },
    {
      title: 'Scheduled Banners',
      value: stats.scheduledAnnouncements,
      description: 'Next 24 hours',
      icon: Calendar,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your Yello Bar admin metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Activity tracking coming soon...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Quick actions coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 