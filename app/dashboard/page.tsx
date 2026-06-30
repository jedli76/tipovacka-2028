import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CompareModal from '../leaderboard/CompareModal'
import ExactTipsModal from './ExactTipsModal'
import TeamName from '@/lib/TeamName'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const [
    { data: leaderboard },
    { data: allPlayers },
    { data: myEntryArr },
    { data: lastMatch },
    { data: upcomingMatches },
  ] = await Promise.all([
    supabase.from('leaderboard').select('*, profiles(display_name)')
      .order('total_points', { ascending: false }).limit(20),
    supabase.from('leaderboard').select('user_id, total_points, profiles(display_name)')
      .order('total_points', { ascending: false }),
    supabase.from('leaderboard').select('*').eq('user_id', user.id).single(),
    // Poslední odehraný zápas
    supabase.from('matches').select('*')
      .not('home_score', 'is', null)
      .order('kickoff_at', { ascending: false }).limit(1),
    // Nadcházející zápasy
    supabase.from('matches').select('*')
      .is('home_score', null)
      .order('kickoff_at', { ascending: true }).limit(5),
  ])

  const myEntry = myEntryArr ?? leaderboard?.find(l => l.user_id === user.id)
  const { count: rankCount } = await supabase
    .from('leaderboard').select('*', { count: 'exact', head: true })
    .gt('total_points', myEntry?.total_points ?? 0)
  const myRank = myEntry ? (rankCount ?? 0) + 1 : null

  const { data: rawExactTips } = await supabase
    .from('tips')
    .select('home_score, away_score, is_joker, points, match_id, matches(home_team, away_team, kickoff_at, group_name, home_score, away_score)')
    .eq('user_id', user.id).not('points', 'is', null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exactTips = (rawExactTips ?? []).filter((t: any) =>
    t.matches?.home_score === t.home_score && t.matches?.away_score === t.away_score
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).map((t: any) => ({
    match_id: t.match_id, home_score: t.home_score, away_score: t.away_score,
    is_joker: t.is_joker, points: t.points,
    home_team: t.matches.home_team, away_team: t.matches.away_team,
    kickoff_at: t.matches.kickoff_at, group_name: t.matches.group_name,
  })).sort((a: { kickoff_at: string }, b: { kickoff_at: string }) =>
    new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()
  )

  const medals = ['🥇', '🥈', '🥉']
  const top3 = leaderboard?.slice(0, 3) ?? []
  const rest = leaderboard?.slice(3) ?? []
  const last = lastMatch?.[0]

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45' }} className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-white">Tipovačka MS 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#94a3b8' }}>👤 {profile?.display_name || user.email}</span>
            <form action="/auth/logout" method="post">
              <button className="text-sm hover:text-white transition-colors" style={{ color: '#94a3b8' }}>Odhlásit se</button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 py-6">
        {/* Stat karty */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Link href="/results" style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, textDecoration: 'none', display: 'block' }} className="p-5">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🏅</div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Moje body</p>
            <p className="text-4xl font-black" style={{ color: '#f59e0b' }}>{myEntry?.total_points ?? 0}</p>
          </Link>
          <Link href="/leaderboard" style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, textDecoration: 'none', display: 'block' }} className="p-5">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📊</div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Moje pořadí</p>
            <p className="text-4xl font-black" style={{ color: '#a78bfa' }}>{myRank ? `${myRank}.` : '–'}</p>
          </Link>
          <ExactTipsModal tips={exactTips} count={myEntry?.correct_results ?? 0} />
          <CompareModal players={(allPlayers ?? []).map(e => ({
            user_id: e.user_id,
            display_name: (e.profiles as unknown as { display_name: string })?.display_name ?? '–',
            total_points: e.total_points,
          }))} asCard />
        </div>

        {/* Rychlé akce */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { href: '/tips', icon: '✏️', label: 'Zadat tipy' },
            { href: '/leaderboard', icon: '🏆', label: 'Žebříček' },
            { href: '/results', icon: '📊', label: 'Výsledky' },
            { href: '/chat', icon: '💬', label: 'Chat' },
            { href: '/rules', icon: '📋', label: 'Pravidla' },
            ...(user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? [{ href: '/admin', icon: '⚙️', label: 'Admin' }] : []),
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#111827', border: '1px solid #1f2d45', borderRadius: 12,
              padding: '9px 16px', textDecoration: 'none', color: '#e2e8f0',
              fontWeight: 600, fontSize: '0.88rem',
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Dvousloupcový layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

          {/* LEVÝ SLOUPEC — Top 20 */}
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>🏆 Top 20</h2>
              <Link href="/leaderboard" style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>celý žebříček →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(leaderboard ?? []).map((entry, i) => {
                const isMe = entry.user_id === user.id
                return (
                  <div key={entry.user_id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 8px', borderRadius: 8,
                    background: isMe ? 'rgba(245,158,11,0.1)' : 'transparent',
                    border: isMe ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: i < 3 ? '1rem' : '0.72rem', fontWeight: 700, color: '#64748b', minWidth: 22, textAlign: 'center', flexShrink: 0 }}>
                        {medals[i] ?? `${i + 1}.`}
                      </span>
                      <span style={{ fontSize: '0.83rem', fontWeight: isMe ? 700 : 500, color: isMe ? '#f59e0b' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(entry.profiles as { display_name: string })?.display_name ?? '–'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', flexShrink: 0, marginLeft: 8 }}>
                      {entry.total_points}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PRAVÝ SLOUPEC */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Galerie slávy — Top 3 */}
            <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px 20px' }}>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: 14 }}>🏅 Galerie slávy</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {top3.map((entry, i) => (
                  <div key={entry.user_id} style={{
                    background: i === 0 ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))'
                      : i === 1 ? 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(100,116,139,0.06))'
                      : 'linear-gradient(135deg, rgba(180,83,9,0.12), rgba(146,64,14,0.06))',
                    border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.3)' : i === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(180,83,9,0.2)'}`,
                    borderRadius: 14, padding: '14px 12px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>{medals[i]}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 4, lineHeight: 1.3 }}>
                      {(entry.profiles as { display_name: string })?.display_name ?? '–'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.3rem', color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#b45309' }}>
                      {entry.total_points}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>bodů</div>
                  </div>
                ))}
              </div>
              {rest.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                  {rest.map((entry, i) => (
                    <span key={entry.user_id} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                      {i + 4}. {(entry.profiles as { display_name: string })?.display_name ?? '–'} <span style={{ color: '#f59e0b', fontWeight: 700 }}>{entry.total_points}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Poslední zápas + Nadcházející */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Poslední odehraný zápas */}
              <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px 20px' }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: 12 }}>⚽ Poslední zápas</h2>
                {last ? (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>{formatDate(last.kickoff_at)}{last.group_name ? ` · Sk. ${last.group_name}` : ''}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <TeamName team={last.home_team} flagSize="1.4em" />
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#fff', background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '4px 12px', flexShrink: 0 }}>
                        {last.home_score}:{last.away_score}
                      </div>
                      <div style={{ flex: 1 }}>
                        <TeamName team={last.away_team} flagSize="1.4em" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>Zatím žádný odehraný zápas.</p>
                )}
              </div>

              {/* Nadcházející zápasy */}
              <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px 20px' }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: 12 }}>📅 Nadcházející zápasy</h2>
                {upcomingMatches && upcomingMatches.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {upcomingMatches.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0, minWidth: 70 }}>{formatDate(m.kickoff_at)}</span>
                        <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>
                          <TeamName team={m.home_team} flagSize="1.2em" />
                          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>–</span>
                          <TeamName team={m.away_team} flagSize="1.2em" />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>Žádné nadcházející zápasy.</p>
                )}
              </div>
            </div>

            {/* Novinky */}
            <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px 20px' }}>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: 12 }}>📰 Novinky</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                Tady budou aktuality a oznámení administrátora. Brzy!
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
