'use client'

import { useState, useTransition } from 'react'
import { saveBio } from './actions'

export default function BioForm({ currentBio }: { currentBio: string | null }) {
  const [bio, setBio] = useState(currentBio ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await saveBio(bio)
      if (res.error) setError(res.error)
      else setSaved(true)
    })
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
        Charakteristika (max 300 znaků)
      </label>
      <textarea
        value={bio}
        onChange={e => { setBio(e.target.value.slice(0, 300)); setSaved(false) }}
        placeholder="Pár slov o sobě — styl tipování, oblíbený tým, něco vtipného…"
        rows={3}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: '12px 14px',
          color: '#e2e8f0',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>{bio.length}/300</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: '0.82rem', color: '#34d399' }}>✓ Uloženo</span>}
          {error && <span style={{ fontSize: '0.82rem', color: '#f87171' }}>{error}</span>}
          <button
            onClick={submit}
            disabled={pending}
            style={{
              background: '#4f46e5',
              border: 'none',
              borderRadius: 10,
              padding: '8px 20px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: pending ? 'default' : 'pointer',
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? 'Ukládám…' : 'Uložit'}
          </button>
        </div>
      </div>
    </div>
  )
}
