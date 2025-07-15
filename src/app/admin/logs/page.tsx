import { createAdminClient } from '@/lib/supabase/server'

export default async function AdminLogsPage() {
  const supabase = createAdminClient()
  const { data: logs, error } = await supabase
    .from('cron_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return <div className="p-6 text-red-600">Fel vid hämtning av loggar: {error.message}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Logs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 border">Tid</th>
              <th className="px-2 py-1 border">Nivå</th>
              <th className="px-2 py-1 border">Meddelande</th>
              <th className="px-2 py-1 border">Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log: {
              id: string;
              created_at: string;
              level: string;
              message: string;
              meta?: unknown;
            }) => (
              <tr key={log.id}>
                <td className="px-2 py-1 border whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-2 py-1 border font-mono">{log.level}</td>
                <td className="px-2 py-1 border">{log.message}</td>
                <td className="px-2 py-1 border font-mono text-xs break-all">{log.meta ? JSON.stringify(log.meta) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 