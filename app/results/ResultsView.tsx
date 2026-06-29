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

function resultLabel(tipH: number, tipA: number, resH: number, resA: number) {
  if (tipH === resH && tipA === resA) return { label: 'Přesný výsledek', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' }
  const tipWinner = tipH > tipA ? 'H' : tipH < tipA ? 'A' : 'D'
  const resWinner = resH > resA ? 'H' : resH < resA ? 'A' : 'D'
  if (tipWinner === resWinner) return { label: 'Správný vítěz', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' }
  return { label: 'Špatný tip', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' }
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

export default function ResultsView({ displayName, matches, tips, bonusQuestions = [], bonusTips = [], tournamentQuestions = [], tournamentTips = [], backHref, backLabel }: Props) {
  const tipsMap = Object.fromEntries(tips.map(t => [t.match_id, t]))
  const matchesMap = Object.fromEntries(matches.map(m => [m.id, m]))

  const bonusTipsMap = Object.fromEntries(bonusTips.map(t => [t.question_id, t]))
  const tournamentTipsMap = Object.fromEntries(tournamentTips.map(t => [t.question_id, t]))

  const tournamentPoints = tournamentTips.reduce((s, t) => s + (t.points ?? 0), 0)
  const bigBonusQuestions = tournamentQuestions.filter(q => q.category === 'bonus')
  const groupAdvQuestions = tournamentQuestions.filter(q => q.category === 'group_advancement')

  // Bonus otázky patřící k danému zápasu (podle posledního match_col_index)
  const bonusByMatchColIndex: Record<number, BonusQuestion[]> = {}
  for (const q of bonusQuestions) {
    if (!q.match_col_indices?.length) continue
    const lastCol = q.match_col_indices[q.match_col_indices.length - 1]
    if (!bonusByMatchColIndex[lastCol]) bonusByMatchColIndex[lastCol] = []
    bonusByMatchColIndex[lastCol].push(q)
  }
  const bonusPoints = bonusTips.reduce((s, t) => s + (t.points ?? 0), 0)
  const bonusCorrect = bonusTips.filter(t => t.points > 0).length

  const totalPoints = tips.reduce((s, t) => s + (t.points ?? 0), 0) + bonusPoints + tournamentPoints
  const tipsWithResult = tips.filter(t => {
    const m = matchesMap[t.match_id]
    return m?.home_score !== null && m?.home_score !== undefined
  })
  const exactCount = tipsWithResult.filter(t => {
    const m = matchesMap[t.match_id]
    return t.home_score === m?.home_score && t.away_score === m?.away_score
  }).length
  const wrongCount = tipsWithResult.filter(t => (t.points ?? 0) === 0).length
  const tippedCount = tips.length

  const jokerTip = tips.find(t => t.is_joker)
  const jokerMatch = jokerTip ? matchesMap[jokerTip.match_id] : null

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45' }} className="px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold">Tipovačka MS 2026</span>
          </div>
          <Link href={backHref} className="text-sm hover:text-white transition-colors" style={{ color: '#64748b' }}>
            ← {backLabel}
          </Link>
        </div>
      </nav>

      <header className="text-center px-4 py-8" style={{ borderBottom: '1px solid #1f2d45', background: 'linear-gradient(180deg, #0f1625 0%, #0a0e1a 100%)' }}>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#f59e0b', letterSpacing: '-0.02em' }}>{displayName}</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>MS 2026 — skupinová fáze</p>

        <div className="flex justify-center gap-6 mt-6 flex-wrap">
          {[
            { val: totalPoints, label: 'Celkem bodů', color: '#f59e0b' },
            { val: exactCount, label: 'Přesných', color: '#22c55e' },
            { val: wrongCount, label: 'Špatných', color: '#ef4444' },
            { val: `${tippedCount} / ${matches.length}`, label: 'Tipováno', color: '#e2e8f0' },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-black" style={{ color: s.color }}>{s.val}</div>
                <div className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: '#64748b' }}>{s.label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, height: 40, background: '#1f2d45' }} />}
            </div>
          ))}
        </div>

        {/* Žolík */}
        <div className="mt-6 mx-auto max-w-sm" style={{
          background: jokerTip ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${jokerTip ? 'rgba(245,158,11,0.4)' : '#1f2d45'}`,
          borderRadius: 12,
          padding: '0.75rem 1.2rem',
        }}>
          {jokerTip && jokerMatch ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#f59e0b' }}>🃏 Žolík použit</div>
                <div className="font-bold" style={{ fontSize: '0.95rem' }}>{jokerMatch.home_team} – {jokerMatch.away_team}</div>
                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  Tip: {jokerTip.home_score}:{jokerTip.away_score}
                  {jokerMatch.home_score !== null && ` · Výsledek: ${jokerMatch.home_score}:${jokerMatch.away_score}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black" style={{ color: '#f59e0b' }}>{jokerTip.points ?? '?'}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>bodů</div>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ color: '#64748b', fontSize: '0.9rem' }}>🃏 Žolík nebyl použit</div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">

          {matches.map(match => {
            const hasResult = match.home_score !== null && match.away_score !== null
            const tip = tipsMap[match.id]
            const hasTip = !!tip
            if (!hasResult && !hasTip) return null

            const evaluated = hasResult && hasTip
            const label = evaluated ? resultLabel(tip.home_score, tip.away_score, match.home_score!, match.away_score!) : null
            const isExact = evaluated && tip.home_score === match.home_score && tip.away_score === match.away_score

            let cardBg = '#111827'
            let cardBorder = '#1f2d45'
            if (tip?.is_joker) {
              cardBg = isExact ? '#1c1500' : '#1a1200'
              cardBorder = isExact ? '#f59e0b' : 'rgba(245,158,11,0.5)'
            } else if (isExact) {
              cardBg = '#0d1f0d'
              cardBorder = '#22c55e'
            }

            const matchBonuses = match.col_index != null ? (bonusByMatchColIndex[match.col_index] ?? []) : []

            return (
              <div key={match.id}>
                <div style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 14,
                  padding: '1rem 1.2rem',
                  boxShadow: isExact ? (tip?.is_joker ? '0 0 20px rgba(245,158,11,0.2)' : '0 0 12px rgba(34,197,94,0.15)') : 'none',
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{formatKickoff(match.kickoff_at)}</span>
                      {match.group_name && (
                        <span style={{ background: '#1a2235', border: '1px solid #1f2d45', borderRadius: 6, padding: '0 6px', fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                          Sk. {match.group_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {tip?.is_joker && (
                        <span style={{ background: 'rgba(245,158,11,0.2)', border: '2px solid rgba(245,158,11,0.7)', borderRadius: 8, padding: '3px 10px', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          🃏 ŽOLÍK
                        </span>
                      )}
                      {isExact && (
                        <span style={{ background: tip?.is_joker ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.2)', border: `2px solid ${tip?.is_joker ? '#f59e0b' : '#22c55e'}`, borderRadius: 8, padding: '3px 10px', fontSize: '0.8rem', color: tip?.is_joker ? '#f59e0b' : '#22c55e', fontWeight: 900 }}>
                          ★ PŘESNÝ TIP
                        </span>
                      )}
                      {evaluated && !isExact && label && (
                        <span style={{ borderRadius: 6, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700 }} className={`border ${label.bg} ${label.color}`}>
                          {label.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-3 flex-1">
                      <span className="font-bold">{match.home_team}</span>
                      <span className="font-bold">{match.away_team}</span>
                    </div>
                    {hasResult && (
                      <div className="flex flex-col items-center gap-3 mx-4">
                        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b', marginBottom: -8 }}>Výsledek</div>
                        <span className="font-black text-xl text-white">{match.home_score}</span>
                        <span className="font-black text-xl text-white">{match.away_score}</span>
                      </div>
                    )}
                    {hasTip && (
                      <div className="flex flex-col items-center gap-3 mx-4">
                        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b', marginBottom: -8 }}>Tip</div>
                        <span className="font-black text-xl" style={{ color: isExact ? (tip?.is_joker ? '#f59e0b' : '#22c55e') : '#94a3b8' }}>{tip.home_score}</span>
                        <span className="font-black text-xl" style={{ color: isExact ? (tip?.is_joker ? '#f59e0b' : '#22c55e') : '#94a3b8' }}>{tip.away_score}</span>
                      </div>
                    )}
                    {evaluated && (
                      <div className="flex flex-col items-center ml-2" style={{ minWidth: 52 }}>
                        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Body</div>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: isExact ? (tip?.is_joker ? '#f59e0b' : '#22c55e') : (tip.points ?? 0) > 0 ? '#60a5fa' : '#ef4444' }}>
                          {tip.points ?? 0}
                        </span>
                      </div>
                    )}
                  </div>

                  {!hasResult && hasTip && (
                    <div className="mt-2 text-xs" style={{ color: '#64748b' }}>Výsledek zatím není znám</div>
                  )}
                </div>

                {matchBonuses.map(q => {
                  const bt = bonusTipsMap[q.id]
                  const isCorrect = bt && bt.points > 0
                  const hasAnswer = !!bt
                  return (
                    <div key={q.id} style={{
                      background: isCorrect ? '#0d1a0d' : hasAnswer ? '#1a1010' : '#0f1521',
                      border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : hasAnswer ? 'rgba(239,68,68,0.25)' : '#1a2535'}`,
                      borderRadius: 10,
                      padding: '0.6rem 1rem',
                      marginTop: 6,
                    }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Bonus</p>
                          <p className="text-sm text-white">{q.question}</p>
                          {hasAnswer && (
                            <p className="text-xs mt-1" style={{ color: isCorrect ? '#22c55e' : '#94a3b8' }}>
                              Tip: <strong>{bt.answer}</strong>
                              {!isCorrect && <span style={{ color: '#64748b' }}> · Správně: <strong style={{ color: '#94a3b8' }}>{q.correct_answer}</strong></span>}
                            </p>
                          )}
                        </div>
                        {hasAnswer && (
                          <span className="font-black text-lg shrink-0" style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
                            {bt.points}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Velké bonusy */}
        {bigBonusQuestions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              🎯 Velké bonusy
              <span className="text-sm font-normal" style={{ color: '#64748b' }}>
                · {tournamentTips.filter(t => {
                  const q = bigBonusQuestions.find(q => q.id === t.question_id)
                  return q && t.points > 0
                }).length} / {bigBonusQuestions.length} správně
              </span>
            </h2>
            <div className="space-y-2">
              {bigBonusQuestions.map(q => {
                const tt = tournamentTipsMap[q.id]
                const isCorrect = tt && tt.points > 0
                const hasAnswer = !!tt
                return (
                  <div key={q.id} style={{
                    background: isCorrect ? '#0d1a0d' : hasAnswer ? '#1a1010' : '#111827',
                    border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : hasAnswer ? 'rgba(239,68,68,0.2)' : '#1f2d45'}`,
                    borderRadius: 12,
                    padding: '0.75rem 1rem',
                  }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">{q.question}</p>
                        {hasAnswer ? (
                          <p className="text-xs" style={{ color: isCorrect ? '#22c55e' : '#94a3b8' }}>
                            Tip: <strong>{tt.answer}</strong>
                            {q.correct_answer && !isCorrect && (
                              <span style={{ color: '#64748b' }}> · Správně: <strong style={{ color: '#94a3b8' }}>{q.correct_answer}</strong></span>
                            )}
                            {!q.correct_answer && !isCorrect && (
                              <span style={{ color: '#64748b' }}> · Výsledek zatím není znám</span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs" style={{ color: '#475569' }}>Bez tipu</p>
                        )}
                      </div>
                      {hasAnswer && (
                        <span className="font-black text-xl shrink-0 mt-1" style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
                          {tt.points}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Postupující ze skupin */}
        {groupAdvQuestions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              🏆 Postupující ze skupin
              <span className="text-sm font-normal" style={{ color: '#64748b' }}>
                · {tournamentTips.filter(t => {
                  const q = groupAdvQuestions.find(q => q.id === t.question_id)
                  return q && t.points > 0
                }).reduce((s, t) => s + t.points, 0)} bodů
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupAdvQuestions.map(q => {
                const tt = tournamentTipsMap[q.id]
                const isCorrect = tt && tt.points > 0
                const hasAnswer = !!tt
                const groupLetter = q.question.match(/skupin[eě]\s+([A-L])/)?.[1] ?? ''
                return (
                  <div key={q.id} style={{
                    background: isCorrect ? '#0d1a0d' : hasAnswer ? '#1a1010' : '#111827',
                    border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : hasAnswer ? 'rgba(239,68,68,0.2)' : '#1f2d45'}`,
                    borderRadius: 12,
                    padding: '0.75rem 1rem',
                  }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>
                          Skupina {groupLetter}
                        </p>
                        {hasAnswer ? (
                          <p className="text-sm" style={{ color: isCorrect ? '#22c55e' : '#94a3b8' }}>
                            {tt.answer}
                          </p>
                        ) : (
                          <p className="text-xs" style={{ color: '#475569' }}>Bez tipu</p>
                        )}
                        {q.correct_answer && hasAnswer && !isCorrect && (
                          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Správně: <strong style={{ color: '#94a3b8' }}>{q.correct_answer}</strong></p>
                        )}
                        {!q.correct_answer && hasAnswer && (
                          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Výsledek zatím není znám</p>
                        )}
                      </div>
                      {hasAnswer && (
                        <span className="font-black text-xl shrink-0 mt-1" style={{ color: isCorrect ? '#22c55e' : tt.points === 0 && !q.correct_answer ? '#64748b' : '#ef4444' }}>
                          {tt.points}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
