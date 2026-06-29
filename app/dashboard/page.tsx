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

  // Načti moje vlastní pořadí samostatně
  const { data: myEntryArr } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const myEntry = myEntryArr ?? leaderboard?.find(l => l.user_id === user.id)

  const { count: rankCount } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .gt('total_points', myEntry?.total_points ?? 0)

  const myRank = myEntry ? (rankCount ?? 0) + 1 : null

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45' }} className="px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-white">Tipovačka MS 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#94a3b8' }}>
              👤 {profile?.display_name || user.email}
            </span>
            <form action="/auth/logout" method="post">
              <button className="text-sm hover:text-white transition-colors" style={{ color: '#94a3b8' }}>
                Odhlásit se
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 py-8">
        {/* Stat karty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16 }} className="p-5">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>Moje body</p>
            <p className="text-4xl font-black" style={{ color: '#f59e0b' }}>
              {myEntry?.total_points ?? 0}
            </p>
          </div>
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16 }} className="p-5">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>Moje pořadí</p>
            <p className="text-4xl font-black" style={{ color: '#a78bfa' }}>
              {myRank ? `#${myRank}` : '–'}
            </p>
          </div>
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16 }} className="p-5">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>Přesné výsledky</p>
            <p className="text-4xl font-black" style={{ color: '#22c55e' }}>
              {myEntry?.correct_results ?? 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rychlé akce */}
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16 }} className="p-5">
            <h2 className="text-lg font-bold mb-4 text-white">Rychlé akce</h2>
            <div className="space-y-2">
              {[
                { href: '/tips', icon: '✏️', label: 'Zadat tipy', sub: 'Tipujte výsledky zápasů' },
                { href: '/leaderboard', icon: '🏆', label: 'Žebříček', sub: 'Kdo vede?' },
                { href: '/results', icon: '📊', label: 'Výsledky', sub: 'Přehled zápasů a bodů' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-700/50"
                  style={{ background: '#1a2235', border: '1px solid #1f2d45' }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-sm" style={{ color: '#64748b' }}>{item.sub}</p>
                  </div>
                </Link>
              ))}
              {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ background: '#1a2235', border: '1px solid #1f2d45' }}
                >
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <p className="font-semibold text-white">Admin</p>
                    <p className="text-sm" style={{ color: '#64748b' }}>Správa zápasů a výsledků</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Top 10 žebříček */}
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16 }} className="p-5">
            <h2 className="text-lg font-bold mb-4 text-white">Top 10 žebříček</h2>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-1">
                {leaderboard.map((entry, i) => {
                  const isMe = entry.user_id === user.id
                  const medals = ['🥇', '🥈', '🥉']
                  return (
                    <div
                      key={entry.user_id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{
                        background: isMe ? 'rgba(245,158,11,0.08)' : 'transparent',
                        border: isMe ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold w-8" style={{ color: '#64748b' }}>
                          {medals[i] ?? `#${i + 1}`}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {(entry.profiles as { display_name: string })?.display_name ?? '–'}
                        </span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: '#f59e0b' }}>
                        {entry.total_points} b
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#64748b' }}>Žádná data.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
