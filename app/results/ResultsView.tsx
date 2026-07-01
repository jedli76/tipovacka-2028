import Link from 'next/link'
import ExactTipsCard, { type ExactTip } from './ExactTipsCard'
import MissedByOneCard, { type MissedByOneTip } from './MissedByOneCard'
import TeamName from '@/lib/TeamName'
import { flag, abbr } from '@/lib/flags'

function AnswerTeams({ answer, inline }: { answer: string; inline?: boolean }) {
  const teams = answer.split(',').map(s => s.trim()).filter(Boolean)
  if (inline) {
    return <>{teams.map((t, i) => <span key={i}>{i > 0 && ', '}<TeamName team={t} flagSize="1.35em" /></span>)}</>
  }
  return <>{teams.map((t, i) => <div key={i}><TeamName team={t} flagSize="1.35em" /></div>)}</>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Match = {
  id: string
  home_team: string
  away_team: string
  kickoff_at: string
  group_name: string | null
  home_score: number | null
  away_score: number | null
  col_index: number | null
}

type Tip = {
  match_id: string
  home_score: number
  away_score: number
  is_joker: boolean
  points: number | null
  brave_bonus?: number | null
}

type BonusQuestion = {
  id: string
  question: string
  correct_answer: string
  sort_order: number
  match_col_indices: number[]
}

type BonusTip = {
  question_id: string
  answer: string
  points: number
}

type TournamentQuestion = {
  id: string
  question: string
  category: string
  correct_answer: string | null
  points_per_correct: number
  sort_order: number
}

type TournamentTip = {
  question_id: string
  answer: string
  points: number
}

type Props = {
  displayName: string
  matches: Match[]
  tips: Tip[]
  bonusQuestions?: BonusQuestion[]
  bonusTips?: BonusTip[]
  tournamentQuestions?: TournamentQuestion[]
  tournamentTips?: TournamentTip[]
  scorerTips?: string[]
  rank?: number | null
  totalPlayers?: number | null
  backHref: string
  backLabel: string
  bio?: string
}

function bonusEmoji(q: string) {
  if (q.includes('penalt') && !q.includes('Proti')) return '⚽'
  if (q.includes('Proti komu')) return '🥅'
  if (q.includes('červen')) return '🟥'
  if (q.includes('nejvíc gólů') && q.includes('tým')) return '🎯'
  if (q.includes('skupin') && q.includes('gól')) return '📊'
  if (q.includes('klubů')) return '🏟️'
  if (q.includes('žlut')) return '🟨'
  if (q.includes('nejmíň')) return '🛡️'
  if (q.includes('trojice')) return '⚡'
  if (q.includes('ŽK')) return '😬'
  if (q.includes('minut')) return '⏱️'
  return '🎲'
}

function shortQuestion(q: string) {
  const map: [RegExp, string][] = [
    [/penalt.*kopat/i, 'Kdo bude kopat penaltu?'],
    [/Proti komu/i, 'Proti komu penalta?'],
    [/červenou/i, 'Kdo dostane červenou?'],
    [/nejvíc gólů.*tým/i, 'Kdo vstřelí nejvíc gólů?'],
    [/skupin.*gól/i, 'Kde padne nejvíc gólů?'],
    [/klubů/i, 'Který klub nastřílí nejvíc?'],
    [/žlut/i, 'Nejvíc žlutých karet?'],
    [/nejmíň/i, 'Nejméně inkasovaných gólů?'],
    [/trojice/i, 'Trojice s nejvíc góly?'],
    [/ŽK.*odečte/i, 'Hráč s ŽK = −10 b'],
    [/minut/i, 'Minuty Sochůrek + Neymar'],
  ]
  for (const [pattern, label] of map) {
    if (pattern.test(q)) return label
  }
  return q.length > 42 ? q.slice(0, 42) + '…' : q
}

const S = {
  page: {
    background: 'linear-gradient(160deg, #0a0f1e 0%, #060b14 60%, #0a0f1e 100%)',
    minHeight: '100vh',
    color: '#e2e8f0',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,

  glass: (alpha = 0.06) => ({
    background: `rgba(255,255,255,${alpha})`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
  } as React.CSSProperties),

  pill: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: `${color}18`,
    border: `1px solid ${color}40`,
    borderRadius: 99,
    padding: '3px 12px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  }),

  label: {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 4,
  } as React.CSSProperties,
}

export default function ResultsView({
  displayName, matches, tips,
  bonusQuestions = [], bonusTips = [],
  tournamentQuestions = [], tournamentTips = [],
  scorerTips = [],
  rank, totalPlayers,
  backHref, backLabel, bio,
}: Props) {
  const tipsMap = Object.fromEntries(tips.map(t => [t.match_id, t]))
  const matchesMap = Object.fromEntries(matches.map(m => [m.id, m]))
  const bonusTipsMap = Object.fromEntries(bonusTips.map(t => [t.question_id, t]))
  const tournamentTipsMap = Object.fromEntries(tournamentTips.map(t => [t.question_id, t]))

  const bonusByMatchCol: Record<number, BonusQuestion[]> = {}
  for (const q of bonusQuestions) {
    if (!q.match_col_indices?.length) continue
    const col = q.match_col_indices[q.match_col_indices.length - 1]
    if (!bonusByMatchCol[col]) bonusByMatchCol[col] = []
    bonusByMatchCol[col].push(q)
  }

  const matchPts = tips.reduce((s, t) => s + (t.points ?? 0) + (t.brave_bonus ?? 0), 0)
  const bonusPts = bonusTips.reduce((s, t) => s + (t.points ?? 0), 0)
  const tournPts = tournamentTips.reduce((s, t) => s + (t.points ?? 0), 0)
  const totalPts = matchPts + bonusPts + tournPts

  const tipsWithResult = tips.filter(t => {
    const m = matchesMap[t.match_id]
    return m?.home_score !== null && m?.home_score !== undefined
  })
  const exactTips: ExactTip[] = tipsWithResult
    .filter(t => {
      const m = matchesMap[t.match_id]
      return t.home_score === m?.home_score && t.away_score === m?.away_score
    })
    .map(t => {
      const m = matchesMap[t.match_id]
      return {
        match_id: t.match_id,
        home_score: t.home_score,
        away_score: t.away_score,
        is_joker: t.is_joker,
        points: t.points ?? 0,
        brave_bonus: t.brave_bonus ?? 0,
        home_team: m.home_team,
        away_team: m.away_team,
        kickoff_at: m.kickoff_at,
        group_name: m.group_name,
      }
    })
    .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())

  const jokerTip = tips.find(t => t.is_joker)
  const jokerMatch = jokerTip ? matchesMap[jokerTip.match_id] : null

  const bigQ = tournamentQuestions.filter(q => q.category === 'bonus' || q.category === 'bonus_small')
  const groupQ = tournamentQuestions.filter(q => q.category === 'group_advancement')

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,11,20,0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 20px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href={backHref} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← {backLabel}
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', fontWeight: 600 }}>MS 2026</span>
        </div>
      </nav>

      {/* Hero header */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 32px' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Profil hráče
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: bio ? 8 : (rank ? 12 : 32) }}>
          {displayName}
        </h1>
        {bio && (
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginBottom: 12, maxWidth: 480 }}>
            {bio}
          </p>
        )}
        {scorerTips.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: rank ? 12 : 32 }}>
            {scorerTips.map((name, i) => (
              <span key={i} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 99, padding: '3px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                ⚽ {name}
              </span>
            ))}
          </div>
        )}
        {rank && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <span style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 100%)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: 99,
              padding: '5px 16px',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#a78bfa',
            }}>
              {rank}. místo
            </span>
            {totalPlayers && (
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>
                z {totalPlayers} tipujících
              </span>
            )}
          </div>
        )}

        {/* Stats row — 4 dlaždice */}
        {(() => {
          const missedByOneTips: MissedByOneTip[] = tipsWithResult
            .filter(t => {
              const m = matchesMap[t.match_id]
              if (!m || m.home_score === null || m.away_score === null) return false
              return Math.abs(t.home_score - m.home_score) + Math.abs(t.away_score - m.away_score) === 1
            })
            .map(t => {
              const m = matchesMap[t.match_id]
              return {
                match_id: t.match_id,
                tip_home: t.home_score,
                tip_away: t.away_score,
                actual_home: m.home_score!,
                actual_away: m.away_score!,
                is_joker: t.is_joker,
                points: t.points ?? 0,
                home_team: m.home_team,
                away_team: m.away_team,
                kickoff_at: m.kickoff_at,
                group_name: m.group_name,
              }
            })
            .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              {/* Celkem bodů */}
              <div style={{
                ...S.glass(0.08),
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}>
                <div style={S.label}>Celkem bodů</div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#a78bfa', lineHeight: 1, letterSpacing: '-0.03em' }}>{totalPts}</div>
                <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>Zápasy {matchPts} · Bonusy {bonusPts + tournPts}</div>
              </div>

              {/* Přesné tipy */}
              <ExactTipsCard exactTips={exactTips} totalWithResult={tipsWithResult.length} />

              {/* Utekl o gól */}
              <MissedByOneCard tips={missedByOneTips} totalWithResult={tipsWithResult.length} />

              {/* Žolík */}
              <div style={{
                ...S.glass(0.08),
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.06) 100%)',
                border: '1px solid rgba(245,158,11,0.35)',
              }}>
                <div style={{ ...S.pill('#f59e0b'), marginBottom: 8, display: 'inline-flex' }}>⚡ Žolík</div>
                {jokerTip && jokerMatch ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{flag(jokerMatch.home_team)}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>{abbr(jokerMatch.home_team)}</span>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>–</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>{abbr(jokerMatch.away_team)}</span>
                      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{flag(jokerMatch.away_team)}</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                      Tip: {jokerTip.home_score}:{jokerTip.away_score}
                      {jokerMatch.home_score !== null && ` · ${jokerMatch.home_score}:${jokerMatch.away_score}`}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1, marginTop: 6 }}>{jokerTip.points ?? '?'} <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>b</span></div>
                  </>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>–</div>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Velké turnajové bonusy */}
        {bigQ.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Turnajové bonusy
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {bigQ.map(q => {
                const tt = tournamentTipsMap[q.id]
                const correct = tt && tt.points > 0
                const pending = !!tt && !q.correct_answer && !correct
                const wrong = !!tt && !correct && !pending

                return (
                  <div key={q.id} style={{
                    background: correct
                      ? 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(16,185,129,0.06) 100%)'
                      : wrong
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${correct ? 'rgba(52,211,153,0.3)' : wrong ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 14,
                    padding: '14px 14px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{bonusEmoji(q.question)}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, lineHeight: 1.3 }}>
                      {shortQuestion(q.question)}
                    </div>
                    {tt ? (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: correct ? '#34d399' : wrong ? 'rgba(255,255,255,0.6)' : '#e2e8f0', marginBottom: 4 }}>
                          <AnswerTeams answer={tt.answer} inline />
                        </div>
                        {wrong && q.correct_answer && (
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>✓ <AnswerTeams answer={q.correct_answer} inline /></div>
                        )}
                        {pending && (
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>čeká se na výsledek</div>
                        )}
                        <div style={{
                          marginTop: 10,
                          fontWeight: 900,
                          fontSize: '1.3rem',
                          color: correct ? '#34d399' : pending ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
                        }}>
                          {pending ? '—' : `+${tt.points}`}
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: 3 }}>b</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem', marginTop: 8 }}>bez tipu</div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Postupující ze skupin */}
        {groupQ.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Postupující ze skupin
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {groupQ.map(q => {
                const tt = tournamentTipsMap[q.id]
                const correct = tt && tt.points > 0
                const pending = !!tt && !q.correct_answer && !correct
                const letter = q.question.match(/skupin[eě]\s+([A-L])/)?.[1] ?? '?'

                return (
                  <div key={q.id} style={{
                    background: correct
                      ? 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(16,185,129,0.06) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${correct ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14,
                    padding: '14px',
                  }}>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Skupina {letter}
                    </div>
                    {tt ? (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: correct ? '#34d399' : 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 8 }}>
                          <AnswerTeams answer={tt.answer} />
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: correct ? '#34d399' : pending ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.15)' }}>
                          {pending ? '—' : `+${tt.points}`}
                          <span style={{ fontSize: '0.72rem', fontWeight: 500, marginLeft: 2 }}>b</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>bez tipu</div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Zápasy */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Tipy na zápasy
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matches.map(match => {
              const hasResult = match.home_score !== null && match.away_score !== null
              const tip = tipsMap[match.id]
              if (!hasResult && !tip) return null

              const evaluated = hasResult && !!tip
              const isExact = evaluated && tip.home_score === match.home_score && tip.away_score === match.away_score
              const isWinner = evaluated && !isExact && (() => {
                const tw = tip.home_score > tip.away_score ? 'H' : tip.home_score < tip.away_score ? 'A' : 'D'
                const rw = match.home_score! > match.away_score! ? 'H' : match.home_score! < match.away_score! ? 'A' : 'D'
                return tw === rw
              })()
              const pts = tip?.points ?? 0
              const braveBonus = tip?.brave_bonus ?? 0
              const isJoker = tip?.is_joker

              const accentColor = isJoker ? '#f59e0b' : isExact ? '#34d399' : isWinner ? '#60a5fa' : null

              const matchBonuses = match.col_index != null ? (bonusByMatchCol[match.col_index] ?? []) : []

              return (
                <div key={match.id}>
                  <div style={{
                    background: isExact && isJoker
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.05) 100%)'
                      : isExact
                      ? 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(16,185,129,0.04) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${accentColor ? `${accentColor}30` : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '8px 16px',
                    alignItems: 'center',
                  }}>
                    {/* Left: teams */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>{formatDate(match.kickoff_at)}</span>
                        {match.group_name && (
                          <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '1px 7px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                            Sk. {match.group_name}
                          </span>
                        )}
                        {isJoker && <span style={S.pill('#f59e0b')}>⚡ Žolík</span>}
                        {isExact && <span style={S.pill(isJoker ? '#f59e0b' : '#34d399')}>★ Přesný</span>}
                        {isWinner && !isExact && <span style={S.pill('#60a5fa')}>✓ Správný vítěz</span>}
                        {braveBonus > 0 && <span style={S.pill('#a78bfa')}>🎯 Odvážný tip +{braveBonus} b</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        <TeamName team={match.home_team} flagSize="1.4em" />
                        <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 6px' }}>–</span>
                        <TeamName team={match.away_team} flagSize="1.4em" />
                      </div>
                    </div>

                    {/* Right: scores + points */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {hasResult && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={S.label}>Výsl.</div>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>
                            {match.home_score}:{match.away_score}
                          </div>
                        </div>
                      )}
                      {tip && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={S.label}>Tip</div>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: accentColor ?? 'rgba(255,255,255,0.4)' }}>
                            {tip.home_score}:{tip.away_score}
                          </div>
                        </div>
                      )}
                      {evaluated && (
                        <div style={{
                          textAlign: 'center',
                          background: accentColor ? `${accentColor}15` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${accentColor ? `${accentColor}30` : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: 12,
                          padding: '6px 14px',
                          minWidth: 56,
                        }}>
                          <div style={S.label}>Body</div>
                          <div style={{ fontWeight: 900, fontSize: '1.4rem', color: accentColor ?? 'rgba(255,255,255,0.2)', lineHeight: 1 }}>
                            {pts + braveBonus}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline bonusy */}
                  {matchBonuses.map(q => {
                    const bt = bonusTipsMap[q.id]
                    const isCorrect = bt && bt.points > 0
                    return (
                      <div key={q.id} style={{
                        marginTop: 4,
                        marginLeft: 16,
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.04)'}`,
                        borderRadius: 10,
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                            Bonus · {shortQuestion(q.question)}
                          </div>
                          {bt && (
                            <div style={{ fontSize: '0.82rem', color: isCorrect ? '#34d399' : 'rgba(255,255,255,0.4)' }}>
                              <AnswerTeams answer={bt.answer} inline />
                              {!isCorrect && q.correct_answer && (
                                <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>· správně: <AnswerTeams answer={q.correct_answer} inline /></span>
                              )}
                            </div>
                          )}
                        </div>
                        {bt && (
                          <span style={{ fontWeight: 900, fontSize: '1rem', color: isCorrect ? '#34d399' : 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                            +{bt.points}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
