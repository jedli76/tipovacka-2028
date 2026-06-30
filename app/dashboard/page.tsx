import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CompareModal from '../leaderboard/CompareModal'
import ExactTipsModal from './ExactTipsModal'
import TeamName from '@/lib/TeamName'
import { flag, abbr } from '@/lib/flags'
import HallOfFamePanel from './HallOfFame'
import { computeHallOfFame } from '@/lib/hallOfFame'
import NewsSection from './NewsSection'
import { isAdmin } from '@/lib/admins'
import DashboardChat from './DashboardChat'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: leaderboard },
    { data: allPlayers },
    { data: lastMatch },
    { data: upcomingMatches },
    { data: last8Matches },
    { data: allTipsRaw },
    { data: allProfilesRaw },
    { data: newsPosts },
  ] = await Promise.all([
    supabase.from('leaderboard').select('*, profiles(display_name)')
      .order('total_points', { ascending: false }).limit(20),
    supabase.from('leaderboard').select('user_id, total_points, profiles(display_name)')
      .order('total_points', { ascending: false }),
    supabase.from('matches').select('*')
      .not('home_score', 'is', null)
      .order('kickoff_at', { ascending: false }).limit(2),
    supabase.from('matches').select('*')
      .is('home_score', null)
      .order('kickoff_at', { ascending: true }).limit(4),
    supabase.from('matches').select('id')
      .not('home_score', 'is', null)
      .order('kickoff_at', { ascending: false }).limit(8),
    supabase.from('tips').select('user_id, home_score, away_score, points, match_id, matches(home_score, away_score, kickoff_at)')
      .not('matches.home_score', 'is', null),
    supabase.from('profiles').select('id, display_name'),
    supabase.from('news').select('id, title, content, cover_image_url, cover_image_position, created_at').eq('published', true).order('sort_order', { ascending: true }).limit(3),
  ])

  // Osobní data — jen pro přihlášené
  let profile = null
  let myEntry = null
  let myRank: number | null = null
  let exactTips: { match_id: string; home_score: number; away_score: number; is_joker: boolean; points: number; home_team: string; away_team: string; kickoff_at: string; group_name: string | null }[] = []
  let lastMatchTips: Record<string, { home_score: number; away_score: number; points: number | null }> = {}

  if (user) {
    const [{ data: profileData }, { data: myEntryData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('leaderboard').select('*').eq('user_id', user.id).single(),
    ])
    profile = profileData
    myEntry = myEntryData ?? leaderboard?.find(l => l.user_id === user.id)

    const { count: rankCount } = await supabase
      .from('leaderboard').select('*', { count: 'exact', head: true })
      .gt('total_points', myEntry?.total_points ?? 0)
    myRank = myEntry ? (rankCount ?? 0) + 1 : null

    const { data: rawExactTips } = await supabase
      .from('tips')
      .select('home_score, away_score, is_joker, points, match_id, matches(home_team, away_team, kickoff_at, group_name, home_score, away_score)')
      .eq('user_id', user.id).not('points', 'is', null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exactTips = (rawExactTips ?? []).filter((t: any) =>
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

    // Tipy pro poslední 2 zápasy
    const lastMatchIds = (lastMatch ?? []).map(m => m.id)
    if (lastMatchIds.length > 0) {
      const { data: lmTips } = await supabase
        .from('tips').select('match_id, home_score, away_score, points')
        .eq('user_id', user.id).in('match_id', lastMatchIds)
      for (const t of lmTips ?? []) {
        lastMatchTips[t.match_id] = { home_score: t.home_score, away_score: t.away_score, points: t.points }
      }
    }
  }

  const medals = ['🥇', '🥈', '🥉']

  const namesMap: Record<string, string> = {}
  for (const p of allProfilesRaw ?? []) namesMap[p.id] = p.display_name ?? '–'

  const last8Ids = new Set((last8Matches ?? []).map(m => m.id))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hofTips = (allTipsRaw ?? []).map((t: any) => ({
    user_id: t.user_id,
    home_score: t.home_score,
    away_score: t.away_score,
    points: t.points,
    match_id: t.match_id,
    kickoff_at: t.matches?.kickoff_at ?? '',
    match_home_score: t.matches?.home_score ?? null,
    match_away_score: t.matches?.away_score ?? null,
  })).filter((t: { kickoff_at: string }) => t.kickoff_at)

  const hof = computeHallOfFame(hofTips, namesMap, last8Ids)

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <style>{`
        .dash-main-grid { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; }
        .dash-match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dash-news-chat { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; align-items: stretch; }
        .dash-nav-name { color: #94a3b8; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
        @media (max-width: 768px) {
          .dash-main-grid { grid-template-columns: 1fr; }
          .dash-match-grid { grid-template-columns: 1fr; }
          .dash-news-chat { grid-template-columns: 1fr; }
          .dash-nav-name { max-width: 100px; font-size: 0.78rem; }
        }
      `}</style>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45' }} className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
            <span className="text-xl" style={{ flexShrink: 0 }}>⚽</span>
            <span className="font-bold text-white" style={{ whiteSpace: 'nowrap' }}>Tipovačka MS 2026</span>
          </div>
          <div className="flex items-center gap-3" style={{ flexShrink: 0, minWidth: 0 }}>
            {user ? (
              <>
                <span className="dash-nav-name">👤 {profile?.display_name || user.email}</span>
                <form action="/auth/logout" method="post">
                  <button className="text-sm hover:text-white transition-colors" style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>Odhlásit se</button>
                </form>
              </>
            ) : (
              <Link href="/auth/login" style={{ fontSize: '0.875rem', color: '#a78bfa', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Přihlásit se →
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 py-6">
        {/* Stat karty */}
        {user ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Link href="/results" style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(251,191,36,0.06) 100%)',
              border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: 20, textDecoration: 'none', display: 'block',
              padding: '20px 22px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: 14, top: 10, fontSize: '3.5rem', opacity: 0.18, userSelect: 'none' }}>🏅</div>
              <p style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.7)', marginBottom: 10 }}>Moje body</p>
              <p style={{ fontSize: '2.8rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1, letterSpacing: '-0.02em' }}>{myEntry?.total_points ?? 0}</p>
            </Link>
            <Link href="/leaderboard" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.06) 100%)',
              border: '1px solid rgba(139,92,246,0.35)',
              borderRadius: 20, textDecoration: 'none', display: 'block',
              padding: '20px 22px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: 14, top: 10, fontSize: '3.5rem', opacity: 0.18, userSelect: 'none' }}>📊</div>
              <p style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', marginBottom: 10 }}>Moje pořadí</p>
              <p style={{ fontSize: '2.8rem', fontWeight: 900, color: '#a78bfa', lineHeight: 1, letterSpacing: '-0.02em' }}>{myRank ? `${myRank}.` : '–'}</p>
            </Link>
            <ExactTipsModal tips={exactTips} count={myEntry?.correct_results ?? 0} />
            <CompareModal players={(allPlayers ?? []).map(e => ({
              user_id: e.user_id,
              display_name: (e.profiles as unknown as { display_name: string })?.display_name ?? '–',
              total_points: e.total_points,
            }))} asCard />
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16, padding: '16px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)' }}>
              👀 Prohlížíš jako host — tipy, chat a osobní statistiky jsou dostupné po přihlášení.
            </p>
            <Link href="/auth/login" style={{
              background: '#4f46e5', borderRadius: 10, padding: '8px 20px',
              color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Přihlásit se →
            </Link>
          </div>
        )}

        {/* Rychlé akce */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            ...(user ? [{ href: '/tips', icon: '✏️', label: 'Zadat tipy' }] : []),
            { href: '/leaderboard', icon: '🏆', label: 'Žebříček' },
            { href: '/results', icon: '📊', label: 'Výsledky' },
            ...(user ? [{ href: '/chat', icon: '💬', label: 'Chat' }] : []),
            ...(user ? [{ href: '/profil', icon: '👤', label: 'Profil' }] : []),
            { href: '/rules', icon: '📋', label: 'Pravidla' },
            ...(isAdmin(user?.email) ? [{ href: '/admin', icon: '⚙️', label: 'Admin' }] : []),
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
        <div className="dash-main-grid">

          {/* LEVÝ SLOUPEC — Top 20 */}
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>🏆 Top 20</h2>
              <Link href="/leaderboard" style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>celý žebříček →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(leaderboard ?? []).map((entry) => {
                const isMe = user ? entry.user_id === user.id : false
                const prizes = ['20 000 Kč', '15 000 Kč', '10 000 Kč']
                const podiumColors = [
                  'rgba(251,191,36,0.18)',
                  'rgba(148,163,184,0.15)',
                  'rgba(180,83,9,0.15)',
                ]
                const podiumBorders = [
                  'rgba(251,191,36,0.35)',
                  'rgba(148,163,184,0.25)',
                  'rgba(180,83,9,0.25)',
                ]
                const ptsColors = ['#fbbf24', '#94a3b8', '#cd7c2f']
                const rank = (leaderboard ?? []).findIndex(e => e.total_points === entry.total_points) + 1
                const isPodium = rank <= 3
                const name = (entry.profiles as { display_name: string })?.display_name ?? '–'

                if (isPodium) {
                  return (
                    <Link key={entry.user_id} href={`/results/${entry.user_id}`} style={{
                      display: 'block', textDecoration: 'none',
                      background: isMe ? 'rgba(245,158,11,0.13)' : podiumColors[rank - 1],
                      border: `1px solid ${isMe ? 'rgba(245,158,11,0.5)' : podiumBorders[rank - 1]}`,
                      borderRadius: 12, padding: '10px 12px', marginBottom: 2,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{medals[rank - 1]}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isMe ? '#f59e0b' : '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: ptsColors[rank - 1], flexShrink: 0 }}>
                          {entry.total_points}
                        </span>
                      </div>
                      <div style={{
                        marginTop: 7, background: 'rgba(0,0,0,0.2)',
                        border: `1px solid ${podiumBorders[rank - 1]}`,
                        borderRadius: 7, padding: '4px 10px',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <span style={{ fontSize: '0.8rem' }}>🏆</span>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: ptsColors[rank - 1] }}>{prizes[rank - 1]}</span>
                      </div>
                    </Link>
                  )
                }

                return (
                  <Link key={entry.user_id} href={`/results/${entry.user_id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '5px 8px', borderRadius: 8, textDecoration: 'none',
                    background: isMe ? 'rgba(245,158,11,0.1)' : 'transparent',
                    border: isMe ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', minWidth: 22, textAlign: 'center', flexShrink: 0 }}>
                        {rank}.
                      </span>
                      <span style={{ fontSize: '0.83rem', fontWeight: isMe ? 700 : 500, color: isMe ? '#f59e0b' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', flexShrink: 0, marginLeft: 8 }}>
                      {entry.total_points}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* PRAVÝ SLOUPEC */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="dash-news-chat">
              <NewsSection posts={newsPosts ?? []} />
              {user ? (
                <DashboardChat currentUserId={user.id} currentDisplayName={profile?.display_name ?? user.email ?? 'Anonym'} />
              ) : (
                <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
                  <p style={{ fontSize: '1.5rem' }}>💬</p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Chat je dostupný<br />po přihlášení</p>
                  <Link href="/auth/login" style={{ fontSize: '0.82rem', color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Přihlásit se →</Link>
                </div>
              )}
            </div>

            {/* Poslední zápas + Nadcházející */}
            <div className="dash-match-grid">

              {/* Poslední odehrané zápasy */}
              <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px 0' }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>⚽ Odehrané zápasy</h2>
              </div>
                {lastMatch && lastMatch.length > 0 ? (
                  <div>
                    {lastMatch.map((m, idx) => {
                      const myTip = lastMatchTips[m.id]
                      return (
                        <div key={m.id} style={{ borderTop: idx > 0 ? '1px solid #1f2d45' : undefined }}>
                          {/* Header řádek */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 0' }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                              {m.group_name ? `Skupina ${m.group_name}` : '⚽ Poslední zápas'}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                              {new Date(m.kickoff_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} · {new Date(m.kickoff_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' })}
                            </span>
                          </div>
                          {/* Zápas */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 14px', gap: 8 }}>
                            {/* Domácí */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', lineHeight: 1 }}>
                                {flag(m.home_team)}
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{abbr(m.home_team)}</span>
                            </div>
                            {/* Skóre + tip */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                              <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '6px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', letterSpacing: '0.04em' }}>
                                  {m.home_score} : {m.away_score}
                                </span>
                              </div>
                              {myTip ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                                    tip: {myTip.home_score}:{myTip.away_score}
                                  </span>
                                  {myTip.points !== null && (
                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: myTip.points > 0 ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
                                      {myTip.points > 0 ? `+${myTip.points} b` : '0 b'}
                                    </span>
                                  )}
                                </div>
                              ) : user ? (
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)' }}>bez tipu</span>
                              ) : null}
                            </div>
                            {/* Hosté */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', lineHeight: 1 }}>
                                {flag(m.away_team)}
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{abbr(m.away_team)}</span>
                            </div>
                          </div>
                          {/* Bonusová otázka */}
                          <div style={{ margin: '0 16px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.7)', marginBottom: 2 }}>Bonusovka</div>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Kdo dá první gól?</div>
                              {user && <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Tip: Mbappé</div>}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Skóroval: Mbappé</div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399' }}>+10 b</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)', padding: '16px 20px' }}>Zatím žádný odehraný zápas.</p>
                )}
              </div>

              {/* Nadcházející zápasy */}
              <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px 0' }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>📅 Následující zápasy</h2>
              </div>
                {upcomingMatches && upcomingMatches.length > 0 ? (
                  <div>
                    {upcomingMatches.map((m, idx) => (
                      <div key={m.id} style={{ borderTop: idx > 0 ? '1px solid #1f2d45' : undefined }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 0' }}>
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                            {m.group_name ? `Skupina ${m.group_name}` : 'Zápas'}
                          </span>
                          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                            {new Date(m.kickoff_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} · {new Date(m.kickoff_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 12px', gap: 8 }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', lineHeight: 1 }}>
                              {flag(m.home_team)}
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{abbr(m.home_team)}</span>
                          </div>
                          <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>vs</span>
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', lineHeight: 1 }}>
                              {flag(m.away_team)}
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{abbr(m.away_team)}</span>
                          </div>
                        </div>
                        {/* Bonusová otázka */}
                        <div style={{ margin: '0 16px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.7)', marginBottom: 2 }}>Bonusovka</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Kdo dá první gól?</div>
                            {user && <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Tip: —</div>}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', flexShrink: 0 }}>čeká se</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)', padding: '16px 20px' }}>Žádné nadcházející zápasy.</p>
                )}
              </div>
            </div>

            <HallOfFamePanel hof={hof} />

          </div>
        </div>
      </main>
    </div>
  )
}
