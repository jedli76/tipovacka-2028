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
    <div className="min-h-screen" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45' }} className="px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-white">Tipovačka MS 2026</span>
          </div>
          <Link href="/dashboard" className="text-sm hover:text-white transition-colors" style={{ color: '#64748b' }}>
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-black text-white mb-2">Žebříček</h1>
        <p className="text-sm mb-6" style={{ color: '#64748b' }}>
          {leaderboard?.length ?? 0} hráčů · klikni na jméno pro detail tipů
        </p>

        {!leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#64748b' }}>Zatím nikdo nezadal tipy.</div>
        ) : (
          <div className="space-y-1">
            {leaderboard.map((entry, i) => {
              const isMe = entry.user_id === user.id
              const medals = ['🥇', '🥈', '🥉']
              const name = (entry.profiles as { display_name: string })?.display_name ?? '–'

              return (
                <Link
                  key={entry.user_id}
                  href={`/results/${entry.user_id}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors"
                  style={{
                    background: isMe ? 'rgba(245,158,11,0.08)' : '#111827',
                    border: `1px solid ${isMe ? 'rgba(245,158,11,0.3)' : '#1f2d45'}`,
                    display: 'flex',
                  }}
                >
                  <div className="w-10 text-center shrink-0">
                    {medals[i] ? (
                      <span className="text-xl">{medals[i]}</span>
                    ) : (
                      <span className="text-sm font-mono" style={{ color: '#64748b' }}>#{i + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: isMe ? '#f59e0b' : '#e2e8f0' }}>
                      {name}
                      {isMe && <span className="text-xs ml-2" style={{ color: '#f59e0b' }}>(já)</span>}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                      {entry.tips_count} tipů · {entry.correct_results} přesných
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-black" style={{ color: '#f59e0b' }}>{entry.total_points}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>bodů</p>
                  </div>

                  <span style={{ color: '#374151', fontSize: '1.1rem' }}>›</span>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
