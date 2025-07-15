import { updateAnnouncementVisibility } from './updateAnnouncementVisibility'

export function startInternalCron() {
  const interval = 60 * 1000 // var 1 minut

  async function cronJob() {
    console.log('⏰ Startar intern cron (Render)')
    try {
      const result = await updateAnnouncementVisibility()
      console.log('📝 Cron-resultat:', result)
    } catch (err) {
      console.error('❌ Fel i updateAnnouncementVisibility:', err)
    }
    // Ping för att hålla Render vaken
    try {
      const res = await fetch('https://admin-yello.onrender.com/api/ping')
      console.log('🌐 Pingade /api/ping:', res.status)
    } catch (err) {
      console.error('❌ Fel vid ping:', err)
    }
  }

  cronJob()
  setInterval(cronJob, interval)
} 