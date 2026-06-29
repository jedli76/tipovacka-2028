import Link from 'next/link'

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague',
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
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
  backHref: string
  backLabel: string
}

// Krátký titulek bonusu z otázky
function bonusTitle(question: string): string {
  if (question.includes('penalt')) return 'KDO BUDE KOPAT PENALTU?'
  if (question.includes('Proti komu')) return 'PROTI KOMU SE BUDE KOPAT PENALTA?'
  if (question.includes('červen')) return 'KDO DOSTANE ČK?'
  if (question.includes('nejvíc gólů') && question.includes('tým')) return 'KTERÝ TÝM VSTŘELÍ NEJVÍC GÓLŮ?'
  if (question.includes('skupin') && question.includes('gól')) return 'VE KTERÉ SKUPINĚ PADNE NEJVÍC GÓLŮ?'
  if (question.includes('klubů')) return 'KTERÝ KLUB NASTŘÍLÍ NEJVÍC GÓLŮ?'
  if (question.includes('žlut')) return 'KTERÁ DVOJICE TÝMŮ NASBÍRÁ NEJVÍC ŽK?'
  if (question.includes('nejmíň gólů')) return 'KTERÁ DVOJICE ZEMÍ DOSTANE NEJMÍŇ GÓLŮ?'
  if (question.includes('trojice')) return 'KTERÁ TROJICE HRÁČŮ VSTŘELÍ NEJVÍCE GÓLŮ?'
  if (question.includes('ŽK')) return 'VYBER HRÁČE – ŽK = -10 B'
  if (question.includes('minut')) return 'MINUTY SOCHŮRKA A NEYMARA'
  return question.slice(0, 40).toUpperCase()
}

function bonusEmoji(question: string): string {
  if (question.includes('penalt')) return '⚽'
  if (question.includes('Proti komu')) return '🥅'
  if (question.includes('červen')) return '🟥'
  if (question.includes('nejvíc gólů') && question.includes('tým')) return '🎯'
  if (question.includes('skupin') && question.includes('gól')) return '📊'
  if (question.includes('klubů')) return '🏟️'
  if (question.includes('žlut')) return '🟨'
  if (question.includes('nejmíň gólů')) return '🛡️'
  if (question.includes('trojice')) return '⚡'
  if (question.includes('ŽK')) return '😬'
  if (question.includes('minut')) return '⏱️'
  return '❓'
}

export default function ResultsView({
  displayName, matches, tips,
  bonusQuestions = [], bonusTips = [],
  tournamentQuestions = [], tournamentTips = [],
  backHref, backLabel,
}: Props) {
  const tipsMap = Object.fromEntries(tips.map(t => [t.match_id, t]))
  const matchesMap = Object.fromEntries(matches.map(m => [m.id, m]))
  const bonusTipsMap = Object.fromEntries(bonusTips.map(t => [t.question_id, t]))
  const tournamentTipsMap = Object.fromEntries(tournamentTips.map(t => [t.question_id, t]))

  const bonusByMatchColIndex: Record<number, BonusQuestion[]> = {}
  for (const q of bonusQuestions) {
    if (!q.match_col_indices?.length) continue
    const lastCol = q.match_col_indices[q.match_col_indices.length - 1]
    if (!bonusByMatchColIndex[lastCol]) bonusByMatchColIndex[lastCol] = []
    bonusByMatchColIndex[lastCol].push(q)
  }

  const matchPoints = tips.reduce((s, t) => s + (t.points ?? 0), 0)
  const bonusPoints = bonusTips.reduce((s, t) => s + (t.points ?? 0), 0)
  const tournamentPoints = tournamentTips.reduce((s, t) => s + (t.points ?? 0), 0)
  const totalPoints = matchPoints + bonusPoints + tournamentPoints

  const tipsWithResult = tips.filter(t => {
    const m = matchesMap[t.match_id]
    return m?.home_score !== null && m?.home_score !== undefined
  })
  const exactCount = tipsWithResult.filter(t => {
    const m = matchesMap[t.match_id]
    return t.home_score === m?.home_score && t.away_score === m?.away_score
  }).length

  const jokerTip = tips.find(t => t.is_joker)
  const jokerMatch = jokerTip ? matchesMap[jokerTip.match_id] : null

  const bigBonusQuestions = tournamentQuestions.filter(q => q.category === 'bonus')
  const groupAdvQuestions = tournamentQuestions.filter(q => q.category === 'group_advancement')

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(13,17,23,0.95)', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }} className="px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={backHref} style={{ color: '#8b949e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← {backLabel}
          </Link>
          <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>MS 2026</span>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)', borderBottom: '1px solid #21262d', padding: '2rem 1rem 1.5rem' }}>
        <div className="max-w-4xl mx-auto">
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f0f6fc', marginBottom: '0.25rem' }}>{displayName}</h1>

          {/* Body badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c6038 0%, #0f3d24 100%)',
              border: '1px solid #2ea043',
              borderRadius: 14,
              padding: '0.9rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flex: 1,
              minWidth: 200,
            }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#3fb950', lineHeight: 1 }}>{totalPoints}</span>
              <div>
                <div style={{ color: '#3fb950', fontWeight: 700, fontSize: '0.9rem' }}>celkových bodů</div>
                <div style={{ color: '#8b949e', fontSize: '0.78rem', marginTop: 2 }}>
                  Přesné výsledky: {exactCount}/{tipsWithResult.length}
                </div>
              </div>
            </div>

            {/* Žolík */}
            {jokerTip && jokerMatch && (
              <div style={{
                background: 'linear-gradient(135deg, #2d1f00 0%, #1a1200 100%)',
                border: '1px solid #f59e0b',
                borderRadius: 14,
                padding: '0.9rem 1.2rem',
                flex: 1,
                minWidth: 200,
              }}>
                <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  ⚡ ŽOLÍK NASAZEN NA
                </div>
                <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.95rem' }}>
                  {jokerMatch.home_team} – {jokerMatch.away_team}
                  {jokerMatch.home_score !== null && ` (${jokerMatch.home_score}:${jokerMatch.away_score})`}
                </div>
                <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: 4 }}>
                  Tip: {jokerTip.home_score}:{jokerTip.away_score}
                  {jokerTip.points !== null && <span style={{ marginLeft: 8, fontWeight: 700 }}>+{jokerTip.points} b</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        {/* Velké turnajové bonusy */}
        {bigBonusQuestions.length > 0 && (
          <section>
            <h2 style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              TURNAJOVÉ BONUSY
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {bigBonusQuestions.map(q => {
                const tt = tournamentTipsMap[q.id]
                const isCorrect = tt && tt.points > 0
                const hasAnswer = !!tt
                const pending = hasAnswer && !q.correct_answer && !isCorrect

                return (
                  <div key={q.id} style={{
                    background: isCorrect ? 'linear-gradient(135deg, #1c3a1c 0%, #0f2010 100%)' : pending ? '#161b22' : hasAnswer ? '#1f1010' : '#161b22',
                    border: `1px solid ${isCorrect ? '#2ea043' : pending ? '#30363d' : hasAnswer ? '#3d1515' : '#21262d'}`,
                    borderRadius: 12,
                    padding: '0.85rem',
                  }}>
                    <div style={{ color: '#8b949e', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{bonusEmoji(q.question)}</span>
                      <span>{bonusTitle(q.question)}</span>
                    </div>
                    {hasAnswer ? (
                      <>
                        <div style={{ color: isCorrect ? '#3fb950' : pending ? '#e2e8f0' : '#ef4444', fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                          {tt.answer}
                          {!isCorrect && !pending && <span style={{ color: '#8b949e', fontWeight: 400, fontSize: '0.8rem', display: 'block' }}>Nevyšlo.</span>}
                        </div>
                        <div style={{ color: isCorrect ? '#3fb950' : pending ? '#8b949e' : '#ef4444', fontWeight: 800, fontSize: '1rem' }}>
                          {pending ? '? b' : `+${tt.points} b`}
                          {isCorrect && <span style={{ color: '#3fb950' }}> ✓</span>}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#484f58', fontSize: '0.85rem' }}>Bez tipu</div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Postupující ze skupin */}
        {groupAdvQuestions.length > 0 && (
          <section>
            <h2 style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              POSTUPUJÍCÍ ZE SKUPIN
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {groupAdvQuestions.map(q => {
                const tt = tournamentTipsMap[q.id]
                const isCorrect = tt && tt.points > 0
                const hasAnswer = !!tt
                const pending = hasAnswer && !q.correct_answer
                const groupLetter = q.question.match(/skupin[eě]\s+([A-L])/)?.[1] ?? '?'

                return (
                  <div key={q.id} style={{
                    background: isCorrect ? 'linear-gradient(135deg, #1c3a1c 0%, #0f2010 100%)' : pending ? '#161b22' : hasAnswer ? '#1f1010' : '#161b22',
                    border: `1px solid ${isCorrect ? '#2ea043' : pending ? '#30363d' : hasAnswer ? '#3d1515' : '#21262d'}`,
                    borderRadius: 12,
                    padding: '0.85rem',
                  }}>
                    <div style={{ color: '#8b949e', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      🏆 SKUPINA {groupLetter}
                    </div>
                    {hasAnswer ? (
                      <>
                        <div style={{ color: isCorrect ? '#3fb950' : pending ? '#e2e8f0' : '#ef4444', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4, lineHeight: 1.3 }}>
                          {tt.answer}
                        </div>
                        <div style={{ color: isCorrect ? '#3fb950' : pending ? '#8b949e' : '#ef4444', fontWeight: 800 }}>
                          {pending ? '? b' : `+${tt.points} b`}
                          {isCorrect && <span> ✓</span>}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#484f58', fontSize: '0.85rem' }}>Bez tipu</div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Zápasy */}
        <section>
          <h2 style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            TIPY NA ZÁPASY
          </h2>
          <div className="space-y-2">
            {matches.map(match => {
              const hasResult = match.home_score !== null && match.away_score !== null
              const tip = tipsMap[match.id]
              const hasTip = !!tip
              if (!hasResult && !hasTip) return null

              const evaluated = hasResult && hasTip
              const isExact = evaluated && tip.home_score === match.home_score && tip.away_score === match.away_score
              const isCorrectWinner = evaluated && !isExact && (() => {
                const tw = tip.home_score > tip.away_score ? 'H' : tip.home_score < tip.away_score ? 'A' : 'D'
                const rw = match.home_score! > match.away_score! ? 'H' : match.home_score! < match.away_score! ? 'A' : 'D'
                return tw === rw
              })()

              const pts = tip?.points ?? 0

              let borderColor = '#21262d'
              if (tip?.is_joker) borderColor = '#f59e0b'
              else if (isExact) borderColor = '#2ea043'
              else if (isCorrectWinner) borderColor = '#1f6feb'

              const matchBonuses = match.col_index != null ? (bonusByMatchColIndex[match.col_index] ?? []) : []

              return (
                <div key={match.id}>
                  <div style={{
                    background: tip?.is_joker ? 'linear-gradient(135deg, #2d1f00 0%, #1a1200 100%)' : isExact ? 'linear-gradient(135deg, #1c3a1c 0%, #0f2010 100%)' : '#161b22',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                    padding: '0.9rem 1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#484f58', fontSize: '0.75rem' }}>{formatKickoff(match.kickoff_at)}</span>
                        {match.group_name && (
                          <span style={{ background: '#21262d', borderRadius: 6, padding: '1px 7px', fontSize: '0.68rem', color: '#8b949e', fontWeight: 700 }}>
                            Sk. {match.group_name}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {tip?.is_joker && (
                          <span style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', borderRadius: 8, padding: '2px 8px', fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800 }}>
                            ⚡ ŽOLÍK
                          </span>
                        )}
                        {isExact && (
                          <span style={{ background: tip?.is_joker ? 'rgba(245,158,11,0.2)' : 'rgba(46,160,67,0.2)', border: `1px solid ${tip?.is_joker ? '#f59e0b' : '#2ea043'}`, borderRadius: 8, padding: '2px 8px', fontSize: '0.72rem', color: tip?.is_joker ? '#f59e0b' : '#3fb950', fontWeight: 800 }}>
                            ★ PŘESNÝ TIP
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{match.home_team}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{match.away_team}</div>
                      </div>

                      {hasResult && (
                        <div style={{ textAlign: 'center', minWidth: 40 }}>
                          <div style={{ fontSize: '0.65rem', color: '#484f58', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Výsl.</div>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#f0f6fc', lineHeight: 1.2 }}>
                            {match.home_score}<br />{match.away_score}
                          </div>
                        </div>
                      )}

                      {hasTip && (
                        <div style={{ textAlign: 'center', minWidth: 36 }}>
                          <div style={{ fontSize: '0.65rem', color: '#484f58', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Tip</div>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2, color: isExact ? (tip?.is_joker ? '#f59e0b' : '#3fb950') : isCorrectWinner ? '#58a6ff' : '#8b949e' }}>
                            {tip.home_score}<br />{tip.away_score}
                          </div>
                        </div>
                      )}

                      {evaluated && (
                        <div style={{ textAlign: 'center', minWidth: 44, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '4px 8px' }}>
                          <div style={{ fontSize: '0.65rem', color: '#484f58', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Body</div>
                          <div style={{ fontWeight: 900, fontSize: '1.3rem', color: isExact ? (tip?.is_joker ? '#f59e0b' : '#3fb950') : pts > 0 ? '#58a6ff' : '#484f58' }}>
                            {pts}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {matchBonuses.map(q => {
                    const bt = bonusTipsMap[q.id]
                    const isCorrect = bt && bt.points > 0
                    const hasAnswer = !!bt
                    return (
                      <div key={q.id} style={{
                        background: isCorrect ? '#0f1f0f' : '#12161e',
                        border: `1px solid ${isCorrect ? '#2ea043' : '#1a2030'}`,
                        borderRadius: 9,
                        padding: '0.55rem 0.9rem',
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.68rem', color: '#484f58', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Bonus</div>
                          <div style={{ fontSize: '0.82rem', color: '#c9d1d9', marginBottom: hasAnswer ? 2 : 0 }}>{q.question}</div>
                          {hasAnswer && (
                            <div style={{ fontSize: '0.78rem', color: isCorrect ? '#3fb950' : '#8b949e' }}>
                              {bt.answer}
                              {!isCorrect && q.correct_answer && <span style={{ color: '#484f58' }}> · správně: {q.correct_answer}</span>}
                            </div>
                          )}
                        </div>
                        {hasAnswer && (
                          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: isCorrect ? '#3fb950' : '#484f58', flexShrink: 0 }}>
                            {bt.points}
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
