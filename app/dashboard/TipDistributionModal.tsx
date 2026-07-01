'use client'

import { useState } from 'react'

type PlayerTip = {
  display_name: string
  home_score: number
  away_score: number
  is_joker: boolean
}

type Props = {
  matchId: string
  homeName: string
  awayName: string
  homeAbbr: string
  awayAbbr: string
  homePct: number
  drawPct: number
  awayPct: number
  total: number
  tips: PlayerTip[]
}

export default function TipDistributionModal({ homeName, awayName, homeAbbr, awayAbbr, homePct, drawPct, awayPct, total, tips }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedScore, setSelectedScore] = useState<string | null>(null)

  const scoreGroups: Record<string, { count: number; jokers: number; players: PlayerTip[] }> = {}
  for (const t of tips) {
    const key = `${t.home_score}:${t.away_score}`
    if (!scoreGroups[key]) scoreGroups[key] = { count: 0, jokers: 0, players: [] }
    scoreGroups[key].count++
    if (t.is_joker) scoreGroups[key].jokers++
    scoreGroups[key].players.push(t)
  }
  for (const g of Object.values(scoreGroups)) {
    g.players.sort((a, b) => {
      if (a.is_joker !== b.is_joker) return a.is_joker ? -1 : 1
      return a.display_name.localeCompare(b.display_name, 'cs')
    })
  }

  const sortedScores = Object.entries(scoreGroups).sort((a, b) => b[1].count - a[1].count)
  const selected = selectedScore ? scoreGroups[selectedScore] : null

  function getColor(score: string) {
    const [h, a] = score.split(':').map(Number)
    return h > a ? '#6366f1' : h < a ? '#f59e0b' : '#64748b'
  }

  return (
    <>
      {/* Klikatelný pruh */}
      <div onClick={() => { setOpen(true); setSelectedScore(null) }} style={{ margin: '0 16px 10px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 6 }}>
          {homePct > 0 && <div style={{ width: `${homePct}%`, background: '#6366f1' }} />}
          {drawPct > 0 && <div style={{ width: `${drawPct}%`, background: '#64748b' }} />}
          {(100 - homePct - drawPct) > 0 && <div style={{ width: `${100 - homePct - drawPct}%`, background: '#f59e0b' }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 700 }}>{homeAbbr} {homePct}%</span>
          <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>Remíza {drawPct}%</span>
          <span style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 700 }}>{100 - homePct - drawPct}% {awayAbbr}</span>
        </div>
        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 2 }}>{total} tipů · klikni pro detail</div>
      </div>

      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setSelectedScore(null) } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{
            background: 'linear-gradient(160deg, #0f1623 0%, #0a0f1a 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            width: '100%', maxWidth: 560,
            maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedScore && (
                  <button onClick={() => setSelectedScore(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', cursor: 'pointer', padding: '0 4px 0 0', lineHeight: 1 }}>←</button>
                )}
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Rozložení tipů</span>
                  <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{homeName} – {awayName}</span>
                </div>
              </div>
              <button onClick={() => { setOpen(false); setSelectedScore(null) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '14px 16px' }}>

              {/* SEZNAM BARŮ */}
              {!selectedScore && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sortedScores.map(([score, { count, jokers }]) => {
                    const pct = Math.round(count / total * 100)
                    const color = getColor(score)
                    return (
                      <div
                        key={score}
                        onClick={() => setSelectedScore(score)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          cursor: 'pointer', borderRadius: 8, padding: '5px 8px',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: 32, textAlign: 'center', fontWeight: 900, fontSize: '0.9rem', color, flexShrink: 0 }}>{score}</div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {jokers > 0 && (
                            <span style={{
                              background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.45)',
                              borderRadius: 99, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 800, color: '#fbbf24',
                            }}>⚡{jokers}</span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', minWidth: 28, textAlign: 'right' }}>{count}×</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* DETAIL SKÓRE */}
              {selectedScore && selected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Velké skóre */}
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: getColor(selectedScore) }}>{selectedScore}</div>

                  {/* Žolíci */}
                  {selected.jokers > 0 && (
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 8 }}>
                        ⚡ Se žolíkem ({selected.jokers})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selected.players.filter(p => p.is_joker).map((p, i) => (
                          <span key={i} style={{
                            background: 'rgba(245,158,11,0.15)',
                            border: '1px solid rgba(245,158,11,0.45)',
                            borderRadius: 99, padding: '5px 14px',
                            fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24',
                          }}>★ {p.display_name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Všichni tipující */}
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                      Všichni tipující ({selected.count})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selected.players.filter(p => !p.is_joker).map((p, i) => (
                        <span key={i} style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 99, padding: '5px 14px',
                          fontSize: '0.8rem', color: '#e2e8f0',
                        }}>{p.display_name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
