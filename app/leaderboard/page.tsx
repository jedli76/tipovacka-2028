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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard.map((entry, i) => {
              const isMe = entry.user_id === user.id
              const medals = ['🥇', '🥈', '🥉']
              const prizes = ['20 000 Kč', '15 000 Kč', '10 000 Kč']
              const podiumColors = [
                { bg: 'linear-gradient(135deg, rgba(251,191,36,0.13) 0%, rgba(245,158,11,0.05) 100%)', border: 'rgba(251,191,36,0.35)', pts: '#fbbf24' },
                { bg: 'linear-gradient(135deg, rgba(148,163,184,0.13) 0%, rgba(100,116,139,0.05) 100%)', border: 'rgba(148,163,184,0.3)', pts: '#94a3b8' },
                { bg: 'linear-gradient(135deg, rgba(180,83,9,0.13) 0%, rgba(146,64,14,0.05) 100%)', border: 'rgba(180,83,9,0.3)', pts: '#cd7c2f' },
              ]
              const name = (entry.profiles as { display_name: string })?.display_name ?? '–'
              const isPodium = i < 3

              if (isPodium) {
                const c = podiumColors[i]
                return (
                  <Link
                    key={entry.user_id}
                    href={`/results/${entry.user_id}`}
                    style={{
                      display: 'block', textDecoration: 'none',
                      background: isMe ? 'rgba(245,158,11,0.13)' : c.bg,
                      border: `1px solid ${isMe ? 'rgba(245,158,11,0.5)' : c.border}`,
                      borderRadius: 16,
                      padding: '16px 20px',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: '2rem', flexShrink: 0 }}>{medals[i]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: '1.05rem', color: isMe ? '#f59e0b' : '#fff', marginBottom: 2 }}>
                          {name}
                          {isMe && <span style={{ fontSize: '0.75rem', marginLeft: 8, color: '#f59e0b' }}>(já)</span>}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                          {entry.tips_count} tipů · {entry.correct_results} přesných
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 900, fontSize: '1.6rem', color: c.pts, lineHeight: 1 }}>{entry.total_points}</p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>bodů</p>
                      </div>
                    </div>
                    </Link>
                )
              }

              return (
                <Link
                  key={entry.user_id}
                  href={`/results/${entry.user_id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '11px 16px', borderRadius: 12, textDecoration: 'none',
                    background: isMe ? 'rgba(245,158,11,0.08)' : '#111827',
                    border: `1px solid ${isMe ? 'rgba(245,158,11,0.3)' : '#1f2d45'}`,
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', width: 28, textAlign: 'center', flexShrink: 0 }}>{i + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.92rem', color: isMe ? '#f59e0b' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                      {isMe && <span style={{ fontSize: '0.72rem', marginLeft: 6, color: '#f59e0b' }}>(já)</span>}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 1 }}>{entry.tips_count} tipů · {entry.correct_results} přesných</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: '#f59e0b' }}>{entry.total_points}</p>
                    <p style={{ fontSize: '0.68rem', color: '#4b5563' }}>bodů</p>
                  </div>
                  <span style={{ color: '#374151', fontSize: '1rem' }}>›</span>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
