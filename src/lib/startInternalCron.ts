import { updateAnnouncementVisibility } from './updateAnnouncementVisibility'

export function startInternalCron() {
  const interval = 5 * 60 * 1000 // var 5:e minut

  console.log('⏰ Startar intern cron (Render)')

  updateAnnouncementVisibility()
  setInterval(updateAnnouncementVisibility, interval)
} 