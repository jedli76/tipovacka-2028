import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*, profiles(display_name)')
    .order('total_points', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-white">Tipovačka EURO 2028</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              👤 {profile?.display_name || user.email}
            </span>
            <form action="/auth/logout" method="post">
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                Odhlásit se
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Moje body</p>
            <p className="text-3xl font-bold text-green-400">
              {leaderboard?.find(l => l.user_id === user.id)?.total_points ?? 0}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Moje pořadí</p>
            <p className="text-3xl font-bold text-yellow-400">
              #{(leaderboard?.findIndex(l => l.user_id === user.id) ?? -1) + 1 || '–'}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Přesné výsledky</p>
            <p className="text-3xl font-bold text-blue-400">
              {leaderboard?.find(l => l.user_id === user.id)?.correct_results ?? 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h2 className="text-lg font-bold mb-4">Rychlé akce</h2>
            <div className="space-y-3">
              <Link href="/tips" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <span className="text-2xl">✏️</span>
                <div>
                  <p className="font-medium">Zadat tipy</p>
                  <p className="text-sm text-gray-400">Tipujte výsledky zápasů</p>
                </div>
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-medium">Žebříček</p>
                  <p className="text-sm text-gray-400">Kdo vede?</p>
                </div>
              </Link>
              <Link href="/results" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium">Výsledky</p>
                  <p className="text-sm text-gray-400">Přehled zápasů a bodů</p>
                </div>
              </Link>
              {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <Link href="/admin" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <p className="font-medium">Admin</p>
                    <p className="text-sm text-gray-400">Správa zápasů a výsledků</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h2 className="text-lg font-bold mb-4">Top 10 žebříček</h2>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={entry.user_id} className={`flex items-center justify-between p-2 rounded-lg ${entry.user_id === user.id ? 'bg-green-500/10 border border-green-500/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-6 text-sm">#{i + 1}</span>
                      <span className="text-sm">{(entry.profiles as { display_name: string })?.display_name}</span>
                    </div>
                    <span className="font-bold text-green-400">{entry.total_points} b</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Turnaj ještě nezačal. Zadejte tipy!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
