'use client'

import { useState } from 'react'

type ExactTip = {
  match_id: string
  home_score: number
  away_score: number
  is_joker: boolean
  points: number
  home_team: string
  away_team: string
  kickoff_at: string
  group_name: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'short',
    timeZone: 'Europe/Prague',
  })
}

export default function ExactTipsModal({ tips, count }: { tips: ExactTip[], count: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '20px', textAlign: 'left', cursor: 'pointer', width: '100%' }}
      >
        <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>Přesné výsledky</p>
        <p className="text-4xl font-black" style={{ color: '#22c55e' }}>{count}</p>
      </button>

      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)',
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
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Přesné tipy</span>
                <span style={{ marginLeft: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>
                  {count} zápasů
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}
              >×</button>
            </div>

            {/* Seznam */}
            <div style={{ overflowY: 'auto', padding: '12px 16px' }}>
              {tips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                  Zatím žádné přesné tipy.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tips.map(t => (
                    <div key={t.match_id} style={{
                      background: t.is_joker ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.05) 100%)' : 'rgba(34,197,94,0.06)',
                      border: `1px solid ${t.is_joker ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.25)'}`,
                      borderRadius: 12,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{formatDate(t.kickoff_at)}</span>
                          {t.group_name && (
                            <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '1px 6px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                              Sk. {t.group_name}
                            </span>
                          )}
                          {t.is_joker && (
                            <span style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 6, padding: '1px 7px', fontSize: '0.65rem', color: '#f59e0b', fontWeight: 800 }}>
                              ⚡ ŽOLÍK
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0' }}>
                          {t.home_team}
                          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 6px' }}>–</span>
                          {t.away_team}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Výsledek</div>
                          <div style={{ fontWeight: 900, color: '#fff', fontSize: '1rem' }}>{t.home_score}:{t.away_score}</div>
                        </div>
                        <div style={{ background: t.is_joker ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${t.is_joker ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 10, padding: '6px 12px', textAlign: 'center', minWidth: 52 }}>
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Body</div>
                          <div style={{ fontWeight: 900, fontSize: '1.2rem', color: t.is_joker ? '#f59e0b' : '#34d399' }}>{t.points}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
