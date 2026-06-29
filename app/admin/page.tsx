import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-white">⚙️ Admin — Tipovačka EURO 2028</span>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Zápasy</h1>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/bonuses"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              🎯 Bonusové otázky
            </Link>
            <a
              href="/api/admin/export-tips"
              download
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              📥 Export tipů (CSV)
            </a>
            <Link
              href="/admin/matches/new"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + Přidat zápas
            </Link>
          </div>
        </div>

        {!matches || matches.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-400">
            Žádné zápasy. Přidejte první zápas.
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map(match => (
              <div key={match.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-white">{match.home_team || '???'} vs {match.away_team || '???'}</p>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {new Date(match.kickoff_at).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {match.group_name && <span className="ml-2">· Skupina {match.group_name}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {match.home_score !== null ? (
                    <span className="font-bold text-green-400">{match.home_score}:{match.away_score}</span>
                  ) : (
                    <span className="text-gray-600 text-sm">bez výsledku</span>
                  )}
                  <Link
                    href={`/admin/matches/${match.id}`}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Upravit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
