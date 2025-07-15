import supabase from './supabaseAdmin'

async function logCron(level: string, message: string, meta?: unknown) {
  await supabase.from('cron_logs').insert([
    {
      level,
      message,
      meta: meta ? JSON.stringify(meta) : null,
    }
  ])
}

export async function updateAnnouncementVisibility() {
  const now = new Date().toISOString()

  console.log('🔁 Kör updateAnnouncementVisibility:', now)
  await logCron('info', 'Kör updateAnnouncementVisibility', { now })

  // Aktivera där scheduledStart har passerat och visibility = false
  const { error: startError } = await supabase
    .from('announcements')
    .update({ visibility: true })
    .lte('scheduledStart', now)
    .eq('visibility', false)

  if (startError) {
    console.error('Fel vid aktivering:', startError)
    await logCron('error', 'Fel vid aktivering', { error: startError })
  }

  // Inaktivera där scheduledEnd har passerat och visibility = true
  const { error: endError } = await supabase
    .from('announcements')
    .update({ visibility: false })
    .lte('scheduledEnd', now)
    .eq('visibility', true)

  if (endError) {
    console.error('Fel vid inaktivering:', endError)
    await logCron('error', 'Fel vid inaktivering', { error: endError })
  }
} 