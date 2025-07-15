import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // OBS: använd denna, inte anon
)

export default supabase
// ✅ Denna används för serveranrop till Supabase med full access. 