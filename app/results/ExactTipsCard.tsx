'use client'

import { useState } from 'react'
import TeamName from '@/lib/TeamName'

export type ExactTip = {
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
    day: 'numeric', month: 'short', timeZone: 'Europe/Prague',
  })
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(52,211,153,0.15)',
  borderRadius: 20,
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: 8,
}

export default function ExactTipsCard({
  exactTips,
  totalWithResult,
}: {
  exactTips: ExactTip[]
  totalWithResult: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          ...glass,
          padding: '18px 20px',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(16,185,129,0.04) 100%)',
          border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 20,
        }}
      >
        <div style={labelStyle}>Přesných tipů</div>
        <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#34d399', lineHeight: 1, letterSpacing: '-0.02em' }}>{exactTips.length}/{totalWithResult}</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>přesný výsledek</div>
      </button>

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
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Přesné tipy</span>
                <span style={{ marginLeft: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>
                  {exactTips.length} zápasů
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}
              >×</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '12px 16px' }}>
              {exactTips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                  Zatím žádné přesné tipy.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {exactTips.map(t => (
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
                          <TeamName team={t.home_team} flagSize="1.4em" />
                          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 6px' }}>–</span>
                          <TeamName team={t.away_team} flagSize="1.4em" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 2 }}>Výsledek</div>
                          <div style={{ fontWeight: 900, color: '#fff', fontSize: '1rem' }}>{t.home_score}:{t.away_score}</div>
                        </div>
                        <div style={{ background: t.is_joker ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${t.is_joker ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 10, padding: '6px 12px', textAlign: 'center' as const, minWidth: 52 }}>
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 2 }}>Body</div>
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
