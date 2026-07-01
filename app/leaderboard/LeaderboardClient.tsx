'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Entry = {
  user_id: string
  total_points: number
  tips_count: number
  correct_results: number
  display_name: string
  rank: number
}

export default function LeaderboardClient({ entries, currentUserId }: { entries: Entry[]; currentUserId: string | null }) {
  const [query, setQuery] = useState('')
  const [suggestOpen, setSuggestOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const suggestions = q.length >= 1
    ? entries.filter(e => e.display_name.toLowerCase().includes(q)).slice(0, 8)
    : []

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function selectSuggestion(entry: Entry) {
    setQuery(entry.display_name)
    setSuggestOpen(false)
    // scroll to the player row
    const el = document.getElementById(`player-${entry.user_id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const highlighted = new Set(q.length >= 1 ? entries.filter(e => e.display_name.toLowerCase().includes(q)).map(e => e.user_id) : [])

  const medals = ['🥇', '🥈', '🥉']
  const podiumColors = [
    { bg: 'linear-gradient(135deg, rgba(251,191,36,0.13) 0%, rgba(245,158,11,0.05) 100%)', border: 'rgba(251,191,36,0.35)', pts: '#fbbf24' },
    { bg: 'linear-gradient(135deg, rgba(148,163,184,0.13) 0%, rgba(100,116,139,0.05) 100%)', border: 'rgba(148,163,184,0.3)', pts: '#94a3b8' },
    { bg: 'linear-gradient(135deg, rgba(180,83,9,0.13) 0%, rgba(146,64,14,0.05) 100%)', border: 'rgba(180,83,9,0.3)', pts: '#cd7c2f' },
  ]

  function highlightText(name: string) {
    if (!q) return <span>{name}</span>
    const idx = name.toLowerCase().indexOf(q)
    if (idx === -1) return <span>{name}</span>
    return (
      <span>
        {name.slice(0, idx)}
        <mark style={{ background: 'rgba(245,158,11,0.35)', color: '#fbbf24', borderRadius: 3, padding: '0 1px' }}>{name.slice(idx, idx + q.length)}</mark>
        {name.slice(idx + q.length)}
      </span>
    )
  }

  return (
    <>
      {/* Search */}
      <div ref={containerRef} style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: suggestOpen && suggestions.length > 0 ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: suggestOpen && suggestions.length > 0 ? '12px 12px 0 0' : 12,
          padding: '10px 14px',
          transition: 'border-color 0.15s',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem', flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSuggestOpen(true) }}
            onFocus={() => setSuggestOpen(true)}
            placeholder="Hledat hráče…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#e2e8f0', fontSize: '0.95rem', fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSuggestOpen(false); inputRef.current?.focus() }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0 }}
            >×</button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestOpen && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: '#111827',
            border: '1px solid rgba(99,102,241,0.5)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
          }}>
            {suggestions.map(e => (
              <button
                key={e.user_id}
                onMouseDown={() => selectSuggestion(e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 16px',
                  color: '#e2e8f0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)' }}
                onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <span style={{ fontSize: '0.75rem', color: '#4b5563', width: 32, flexShrink: 0 }}>{e.rank}.</span>
                <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{highlightText(e.display_name)}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b' }}>{e.total_points} b</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {entries.map(entry => {
          const isMe = entry.user_id === currentUserId
          const isHighlighted = highlighted.has(entry.user_id)
          const dimmed = highlighted.size > 0 && !isHighlighted
          const { rank, display_name: name } = entry
          const isPodium = rank <= 3

          if (isPodium) {
            const c = podiumColors[rank - 1]
            return (
              <Link
                key={entry.user_id}
                id={`player-${entry.user_id}`}
                href={`/results/${entry.user_id}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  background: isMe ? 'rgba(245,158,11,0.13)' : c.bg,
                  border: `2px solid ${isHighlighted ? '#6366f1' : isMe ? 'rgba(245,158,11,0.5)' : c.border}`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  marginBottom: 2,
                  opacity: dimmed ? 0.3 : 1,
                  transition: 'opacity 0.2s, border-color 0.2s',
                  boxShadow: isHighlighted ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: '2rem', flexShrink: 0 }}>{medals[rank - 1]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: '1.05rem', color: isMe ? '#f59e0b' : '#fff', marginBottom: 2 }}>
                      {isHighlighted ? highlightText(name) : name}
                      {isMe && <span style={{ fontSize: '0.75rem', marginLeft: 8, color: '#f59e0b' }}>(já)</span>}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                      {entry.tips_count} tipů · {entry.correct_results} přesných
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: '1.6rem', color: c.pts, lineHeight: 1 }}>{entry.total_points}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>bodů</p>
                  </div>
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={entry.user_id}
              id={`player-${entry.user_id}`}
              href={`/results/${entry.user_id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '11px 16px', borderRadius: 12, textDecoration: 'none',
                background: isMe ? 'rgba(245,158,11,0.08)' : '#111827',
                border: `1px solid ${isHighlighted ? '#6366f1' : isMe ? 'rgba(245,158,11,0.3)' : '#1f2d45'}`,
                opacity: dimmed ? 0.3 : 1,
                transition: 'opacity 0.2s, border-color 0.2s',
                boxShadow: isHighlighted ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', width: 28, textAlign: 'center', flexShrink: 0 }}>{rank}.</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.92rem', color: isMe ? '#f59e0b' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isHighlighted ? highlightText(name) : name}
                  {isMe && <span style={{ fontSize: '0.72rem', marginLeft: 6, color: '#f59e0b' }}>(já)</span>}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 1 }}>{entry.tips_count} tipů · {entry.correct_results} přesných</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: '#f59e0b' }}>{entry.total_points}</p>
                <p style={{ fontSize: '0.68rem', color: '#4b5563' }}>bodů</p>
              </div>
              <span style={{ color: '#374151', fontSize: '1rem' }}>›</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
