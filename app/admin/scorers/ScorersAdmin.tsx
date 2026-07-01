'use client'

import { useState, useTransition } from 'react'
import { updateScorerGoals } from './actions'

type Scorer = {
  name: string
  goals: number
  tip_count: number
  is_top: boolean
}

const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  padding: '6px 10px',
  color: '#e2e8f0',
  fontSize: '0.85rem',
  outline: 'none',
  width: 64,
  textAlign: 'center' as const,
}

function ScorerRow({ scorer }: { scorer: Scorer }) {
  const [goals, setGoals] = useState(scorer.goals)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [pending, start] = useTransition()

  function save() {
    setErr('')
    start(async () => {
      const res = await updateScorerGoals(scorer.name, goals)
      if (res.error) {
        setErr(res.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  const changed = goals !== scorer.goals
  const isTop = scorer.is_top && goals > 0

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      background: isTop ? 'rgba(245,158,11,0.07)' : scorer.goals > 0 ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isTop ? 'rgba(245,158,11,0.3)' : scorer.goals > 0 ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 10,
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0, width: 20, textAlign: 'center' }}>
        {isTop ? '👑' : ''}
      </span>
      <span style={{ flex: 1, fontSize: '0.88rem', color: isTop ? '#f59e0b' : '#e2e8f0', fontWeight: scorer.goals > 0 ? 700 : 400 }}>
        {scorer.name}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>
        {scorer.tip_count} tipů
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => setGoals(g => Math.max(0, g - 1))}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#e2e8f0', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >−</button>
        <input
          type="number"
          value={goals}
          min={0}
          onChange={e => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
          style={inputStyle}
        />
        <button
          onClick={() => setGoals(g => g + 1)}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#e2e8f0', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >+</button>
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, minWidth: 60, textAlign: 'right', color: isTop ? '#f59e0b' : '#a5b4fc' }}>
        {goals > 0 ? `+${goals * 10 + (isTop ? 10 : 0)} b` : ''}
      </span>
      {(changed || saved) && (
        <button
          onClick={save}
          disabled={pending || !changed}
          style={{
            background: saved ? '#34d399' : '#4f46e5',
            border: 'none',
            borderRadius: 8,
            padding: '6px 14px',
            color: '#fff',
            fontWeight: 700,
            cursor: pending ? 'default' : 'pointer',
            fontSize: '0.8rem',
            flexShrink: 0,
            opacity: pending ? 0.6 : 1,
            minWidth: 70,
          }}
        >
          {pending ? '...' : saved ? '✓' : 'Uložit'}
        </button>
      )}
      {err && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{err}</span>}
    </div>
  )
}

export default function ScorersAdmin({ scorers }: { scorers: Scorer[] }) {
  const [search, setSearch] = useState('')
  const withGoals = scorers.filter(s => s.goals > 0)
  const filtered = scorers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const maxGoals = withGoals.length > 0 ? Math.max(...withGoals.map(s => s.goals)) : 0
  const topScorers = withGoals.filter(s => s.goals === maxGoals)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Střelci s góly</div>
          <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#f59e0b' }}>{withGoals.length}</div>
        </div>
        {maxGoals > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>👑 Nejlepší střelec</div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#f59e0b' }}>{topScorers.map(s => s.name).join(', ')} ({maxGoals} gólů)</div>
          </div>
        )}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hledat střelce..."
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '8px 14px',
            color: '#e2e8f0',
            fontSize: '0.88rem',
            outline: 'none',
            width: 200,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(s => (
          <ScorerRow key={s.name} scorer={s} />
        ))}
      </div>
    </div>
  )
}
