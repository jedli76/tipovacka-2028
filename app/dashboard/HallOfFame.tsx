'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { HallOfFame, HofCategory, HofEntry } from '@/lib/hallOfFame'

function Card({
  icon, label, category, unit, suffix, format,
}: {
  icon: string
  label: string
  category: HofCategory | null
  unit?: string
  suffix?: string
  format?: (v: number) => string
}) {
  const [open, setOpen] = useState(false)
  const empty = !category

  function fmt(v: number) {
    if (format) return format(v)
    return String(v)
  }

  return (
    <div style={{
      background: open ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'background 0.15s, border-color 0.15s',
    }}>
      {/* Hlavní řádek */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
          {icon} {label}
        </div>
        {empty ? (
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>Zatím bez dat</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#f59e0b', lineHeight: 1, marginBottom: 4 }}>
                {fmt(category.leader.value)}
                {unit && <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: 4, color: 'rgba(255,255,255,0.4)' }}>{unit}</span>}
                {suffix && <span style={{ fontSize: '1.2rem', marginLeft: 2 }}>{suffix}</span>}
              </div>
              <Link
                href={`/results/${category.leader.user_id}`}
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', textDecoration: 'none' }}
                onClick={e => e.stopPropagation()}
              >
                {category.leader.display_name}
              </Link>
            </div>
            {category.top10.length > 1 && (
              <button
                onClick={() => setOpen(o => !o)}
                style={{
                  background: open ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${open ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  color: open ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                TOP {Math.min(category.top10.length, 10)} {open ? '▲' : '▸'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rozbalovací seznam */}
      {open && category && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px 0 4px' }}>
          {category.top10.map((entry: HofEntry, i: number) => (
            <Link
              key={entry.user_id}
              href={`/results/${entry.user_id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 16px',
                textDecoration: 'none',
                background: i === 0 ? 'rgba(245,158,11,0.06)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i === 0 ? 'rgba(245,158,11,0.06)' : 'transparent' }}
            >
              <span style={{
                fontSize: '0.7rem', fontWeight: 800, width: 20, textAlign: 'center', flexShrink: 0,
                color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : 'rgba(255,255,255,0.25)',
              }}>
                {i + 1}.
              </span>
              <span style={{ flex: 1, fontSize: '0.8rem', color: '#e2e8f0', fontWeight: i === 0 ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.display_name}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
                {fmt(entry.value)}{unit ? ` ${unit}` : ''}{suffix ?? ''}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HallOfFamePanel({ hof }: { hof: HallOfFame }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px 20px' }}>
      <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: 14 }}>🏅 Galerie slávy</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
        <Card icon="⚽" label="Nejvíce bodů za tipy (bez bonusovek)" category={hof.topMatchPoints} unit="b" />
        <Card icon="🎯" label="Nejvíce přesných tipů" category={hof.mostExact} unit="tipů" />
        <Card icon="🏆" label="Nejlepší série" category={hof.bestStreak} suffix="🏆" unit="v řadě" />
        <Card icon="🔥" label="Aktuální série" category={hof.currentStreak} suffix="🔥" unit="v řadě" />
        <Card icon="😬" label="Aktuální série nul" category={hof.currentZeroStreak} unit="× 0b" />
        <Card icon="😢" label="Smolař (o 1 gól od přesného)" category={hof.nearMiss} unit="×" />
      </div>
    </div>
  )
}
