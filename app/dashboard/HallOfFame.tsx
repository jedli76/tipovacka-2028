'use client'

import type { HallOfFame, HofEntry } from '@/lib/hallOfFame'

function Card({ icon, label, entry, unit, suffix }: {
  icon: string
  label: string
  entry: HofEntry | null
  unit?: string
  suffix?: string
}) {
  const empty = !entry || entry.value === 0
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
        {icon} {label}
      </div>
      {empty ? (
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>Zatím bez dat</div>
      ) : (
        <>
          <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#f59e0b', lineHeight: 1, marginBottom: 4 }}>
            {entry!.value}{unit && <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: 4, color: 'rgba(255,255,255,0.4)' }}>{unit}</span>}
            {suffix && <span style={{ fontSize: '1.2rem', marginLeft: 2 }}>{suffix}</span>}
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{entry!.display_name}</div>
        </>
      )}
    </div>
  )
}

export default function HallOfFamePanel({ hof }: { hof: HallOfFame }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px 20px' }}>
      <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: 14 }}>🏅 Galerie slávy</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
        <Card icon="⚽" label="Nejvíce bodů za tipy (bez bonusovek)" entry={hof.topMatchPoints} unit="b" />
        <Card icon="🎯" label="Nejvíce přesných tipů" entry={hof.mostExact} unit="tipů" />
        <Card icon="🏆" label="Nejlepší série" entry={hof.bestStreak} suffix="🏆" unit="v řadě" />
        <Card icon="🔥" label="Aktuální série" entry={hof.currentStreak} suffix="🔥" unit="v řadě" />
        <Card icon="😬" label="Aktuální série nul" entry={hof.currentZeroStreak} unit="× 0b" />
        <Card icon="🚀" label="Skokan (posl. 8 zápasů)" entry={hof.hotStreak} unit="b" />
        <Card icon="😢" label="Smolař (o 1 gól od přesného)" entry={hof.nearMiss} unit="×" />
      </div>
    </div>
  )
}
