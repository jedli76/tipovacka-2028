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

  return (
    <>
      <div onClick={() => { setOpen(true); setSelectedScore(null) }} style={{ margin: '0 16px 10px', cursor: 'pointer' }} title="Zobrazit rozložení tipů">
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
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
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
              <div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Rozložení tipů</span>
                <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{homeName} – {awayName}</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Bary skóre */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sortedScores.map(([score, { count, jokers }]) => {
                  const pct = Math.round(count / total * 100)
                  const [h, a] = score.split(':').map(Number)
                  const color = h > a ? '#6366f1' : h < a ? '#f59e0b' : '#64748b'
                  const isSelected = selectedScore === score
                  return (
                    <div
                      key={score}
                      onClick={() => setSelectedScore(isSelected ? null : score)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        cursor: 'pointer', borderRadius: 8, padding: '5px 8px',
                        background: isSelected ? `${color}18` : 'transparent',
                        border: `1px solid ${isSelected ? `${color}50` : 'transparent'}`,
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ width: 32, textAlign: 'center', fontWeight: 900, fontSize: '0.88rem', color, flexShrink: 0 }}>{score}</div>
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

              {/* Detail vybraného skóre */}
              {selected && selectedScore && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                  {/* Nadpis */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    {(() => {
                      const [h, a] = selectedScore.split(':').map(Number)
                      const color = h > a ? '#6366f1' : h < a ? '#f59e0b' : '#64748b'
                      return <span style={{ fontWeight: 900, fontSize: '1.4rem', color }}>{selectedScore}</span>
                    })()}
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>· {selected.count} hráčů</span>
                  </div>

                  {/* Žolíci */}
                  {selected.jokers > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 6 }}>
                        ⚡ Se žolíkem ({selected.jokers})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selected.players.filter(p => p.is_joker).map((p, i) => (
                          <span key={i} style={{
                            background: 'rgba(245,158,11,0.15)',
                            border: '1px solid rgba(245,158,11,0.4)',
                            borderRadius: 99, padding: '4px 12px',
                            fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24',
                          }}>
                            ★ {p.display_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ostatní hráči */}
                  <div>
                    {selected.players.filter(p => !p.is_joker).length > 0 && (
                      <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
                        Všichni tipující ({selected.count})
                      </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selected.players.filter(p => !p.is_joker).map((p, i) => (
                        <span key={i} style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 99, padding: '4px 12px',
                          fontSize: '0.78rem', color: '#e2e8f0',
                        }}>
                          {p.display_name}
                        </span>
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
