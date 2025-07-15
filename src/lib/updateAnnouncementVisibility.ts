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
  let activatedCount = 0
  let deactivatedCount = 0
  let error: unknown = null

  console.log('🔁 Kör updateAnnouncementVisibility:', now)

  // Aktivera där scheduledStart har passerat och visibility = false
  const { error: startError, data: activatedData } = await supabase
    .from('announcements')
    .update({ visibility: true })
    .lte('scheduledStart', now)
    .eq('visibility', false)
    .select()

  if (startError) {
    error = startError
    console.error('Fel vid aktivering:', startError)
  } else {
    activatedCount = activatedData ? activatedData.length : 0
    console.log(`✅ Aktiverade bars: ${activatedCount}`)
  }

  // Inaktivera där scheduledEnd har passerat och visibility = true
  const { error: endError, data: deactivatedData } = await supabase
    .from('announcements')
    .update({ visibility: false })
    .lte('scheduledEnd', now)
    .eq('visibility', true)
    .select()

  if (endError) {
    error = endError
    console.error('Fel vid inaktivering:', endError)
  } else {
    deactivatedCount = deactivatedData ? deactivatedData.length : 0
    console.log(`✅ Inaktiverade bars: ${deactivatedCount}`)
  }

  // Logga resultatet
  const meta: Record<string, unknown> = { now, activatedCount, deactivatedCount }
  if (error) meta.error = error
  await logCron(error ? 'error' : 'info', 'updateAnnouncementVisibility', meta)

  return { now, activatedCount, deactivatedCount, error }
} 