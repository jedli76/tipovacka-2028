import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CompareModal from '../leaderboard/CompareModal'
import ExactTipsModal from './ExactTipsModal'

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

  const { data: allPlayers } = await supabase
    .from('leaderboard')
    .select('user_id, total_points, profiles(display_name)')
    .order('total_points', { ascending: false })

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

  // Přesné tipy — pouze zápasy kde tipovaný výsledek přesně odpovídá skutečnému
  const { data: rawExactTips } = await supabase
    .from('tips')
    .select('home_score, away_score, is_joker, points, match_id, matches(home_team, away_team, kickoff_at, group_name, home_score, away_score)')
    .eq('user_id', user.id)
    .not('points', 'is', null)

  const exactTips = (rawExactTips ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => t.matches?.home_score === t.home_score && t.matches?.away_score === t.away_score)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => ({
      match_id: t.match_id,
      home_score: t.home_score,
      away_score: t.away_score,
      is_joker: t.is_joker,
      points: t.points,
      home_team: t.matches.home_team,
      away_team: t.matches.away_team,
      kickoff_at: t.matches.kickoff_at,
      group_name: t.matches.group_name,
    }))
    .sort((a: { kickoff_at: string }, b: { kickoff_at: string }) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/results" style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, textDecoration: 'none', display: 'block' }} className="p-5">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🏅</div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>Moje body</p>
            <p className="text-4xl font-black" style={{ color: '#f59e0b' }}>
              {myEntry?.total_points ?? 0}
            </p>
          </Link>
          <Link href="/leaderboard" style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, textDecoration: 'none', display: 'block' }} className="p-5">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📊</div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>Moje pořadí</p>
            <p className="text-4xl font-black" style={{ color: '#a78bfa' }}>
              {myRank ? `${myRank}.` : '–'}
            </p>
          </Link>
          <ExactTipsModal tips={exactTips} count={myEntry?.correct_results ?? 0} />
          <CompareModal players={(allPlayers ?? []).map(e => ({
            user_id: e.user_id,
            display_name: (e.profiles as unknown as { display_name: string })?.display_name ?? '–',
            total_points: e.total_points,
          }))} asCard />
        </div>

        {/* Rychlé akce — horizontální menu */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { href: '/tips', icon: '✏️', label: 'Zadat tipy' },
            { href: '/leaderboard', icon: '🏆', label: 'Žebříček' },
            { href: '/results', icon: '📊', label: 'Výsledky' },
            { href: '/chat', icon: '💬', label: 'Chat' },
            { href: '/rules', icon: '📋', label: 'Pravidla' },
            ...(user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? [{ href: '/admin', icon: '⚙️', label: 'Admin' }] : []),
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#111827', border: '1px solid #1f2d45', borderRadius: 12,
                padding: '10px 18px', textDecoration: 'none', color: '#e2e8f0',
                fontWeight: 600, fontSize: '0.9rem', transition: 'border-color 0.15s',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div>
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
