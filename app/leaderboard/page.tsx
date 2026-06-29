import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*, profiles(display_name)')
    .order('total_points', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-white">Tipovačka EURO 2028</span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Žebříček</h1>

        {!leaderboard || leaderboard.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-400">
            Zatím nikdo nezadal tipy.
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => {
              const isMe = entry.user_id === user.id
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                    isMe
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <div className="w-8 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-gray-500 text-sm font-mono">#{i + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isMe ? 'text-green-400' : 'text-white'}`}>
                      {(entry.profiles as { display_name: string })?.display_name}
                      {isMe && <span className="text-xs text-green-500 ml-2">(já)</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {entry.tips_count} tipů · {entry.correct_results} přesných
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{entry.total_points}</p>
                    <p className="text-xs text-gray-500">bodů</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
