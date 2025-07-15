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

  // Hämta ID:n på de som ska aktiveras
  const { data: toActivate, error: selectActivateError } = await supabase
    .from('announcements')
    .select('id')
    .lte('scheduledStart', now)
    .eq('visibility', false)

  if (selectActivateError) {
    error = selectActivateError
    console.error('Fel vid select för aktivering:', selectActivateError)
  } else {
    activatedCount = toActivate ? toActivate.length : 0
    console.log(`🔎 Bars att aktivera: ${activatedCount}`)
    if (activatedCount > 0) {
      const { error: startError } = await supabase
        .from('announcements')
        .update({ visibility: true })
        .in('id', toActivate.map(a => a.id))
      if (startError) {
        error = startError
        console.error('Fel vid aktivering:', startError)
      } else {
        console.log(`✅ Aktiverade bars: ${activatedCount}`)
      }
    }
  }

  // Hämta ID:n på de som ska inaktiveras
  const { data: toDeactivate, error: selectDeactivateError } = await supabase
    .from('announcements')
    .select('id')
    .lte('scheduledEnd', now)
    .eq('visibility', true)

  if (selectDeactivateError) {
    error = selectDeactivateError
    console.error('Fel vid select för inaktivering:', selectDeactivateError)
  } else {
    deactivatedCount = toDeactivate ? toDeactivate.length : 0
    console.log(`🔎 Bars att inaktivera: ${deactivatedCount}`)
    if (deactivatedCount > 0) {
      const { error: endError } = await supabase
        .from('announcements')
        .update({ visibility: false })
        .in('id', toDeactivate.map(a => a.id))
      if (endError) {
        error = endError
        console.error('Fel vid inaktivering:', endError)
      } else {
        console.log(`✅ Inaktiverade bars: ${deactivatedCount}`)
      }
    }
  }

  // Logga resultatet
  const meta: Record<string, unknown> = { now, activatedCount, deactivatedCount }
  if (error) meta.error = error
  await logCron(error ? 'error' : 'info', 'updateAnnouncementVisibility', meta)

  return { now, activatedCount, deactivatedCount, error }
} 