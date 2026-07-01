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

  // Seskup tipy podle skóre, seřaď podle počtu
  const scoreGroups: Record<string, { count: number; jokers: number }> = {}
  for (const t of tips) {
    const key = `${t.home_score}:${t.away_score}`
    if (!scoreGroups[key]) scoreGroups[key] = { count: 0, jokers: 0 }
    scoreGroups[key].count++
    if (t.is_joker) scoreGroups[key].jokers++
  }
  const sortedScores = Object.entries(scoreGroups).sort((a, b) => b[1].count - a[1].count)

  return (
    <>
      {/* Klikatelný pruh */}
      <div
        onClick={() => setOpen(true)}
        style={{ margin: '0 16px 10px', cursor: 'pointer' }}
        title="Zobrazit rozložení tipů"
      >
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 6 }}>
          {homePct > 0 && <div style={{ width: `${homePct}%`, background: '#6366f1' }} />}
          {drawPct > 0 && <div style={{ width: `${drawPct}%`, background: '#64748b' }} />}
          {awayPct > 0 && <div style={{ width: `${100 - homePct - drawPct}%`, background: '#f59e0b' }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 700 }}>{homeAbbr} {homePct}%</span>
          <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>Remíza {drawPct}%</span>
          <span style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 700 }}>{awayPct}% {awayAbbr}</span>
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
            width: '100%', maxWidth: 540,
            maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Rozložení tipů</span>
                <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{homeName} – {awayName}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}
              >×</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Přehled skóre */}
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Tipovaná skóre</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {sortedScores.map(([score, { count, jokers }]) => {
                    const pct = Math.round(count / total * 100)
                    const [h, a] = score.split(':').map(Number)
                    const color = h > a ? '#6366f1' : h < a ? '#f59e0b' : '#64748b'
                    return (
                      <div key={score} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, textAlign: 'center', fontWeight: 900, fontSize: '0.85rem', color, flexShrink: 0 }}>{score}</div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
                        </div>
                        <div style={{ width: 70, textAlign: 'right', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                          {count} hráčů{jokers > 0 ? <span style={{ color: '#f59e0b' }}> · ⚡{jokers}</span> : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Seznam hráčů */}
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Všichni hráči</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {tips
                    .slice()
                    .sort((a, b) => {
                      const scoreA = `${a.home_score}:${a.away_score}`
                      const scoreB = `${b.home_score}:${b.away_score}`
                      if (scoreA !== scoreB) {
                        // seřaď podle popularity skóre
                        return (scoreGroups[scoreB]?.count ?? 0) - (scoreGroups[scoreA]?.count ?? 0)
                      }
                      return a.display_name.localeCompare(b.display_name, 'cs')
                    })
                    .map((t, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: t.is_joker ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${t.is_joker ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)'}`,
                        borderRadius: 8,
                      }}>
                        <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: t.is_joker ? 700 : 400 }}>
                          {t.is_joker && <span style={{ color: '#f59e0b', marginRight: 5 }}>⚡</span>}
                          {t.display_name}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: (() => {
                          const h = t.home_score, a = t.away_score
                          return h > a ? '#6366f1' : h < a ? '#f59e0b' : '#64748b'
                        })() }}>
                          {t.home_score}:{t.away_score}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
