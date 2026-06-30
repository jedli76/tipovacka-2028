'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'

type Player = {
  user_id: string
  display_name: string
  total_points: number
}

type CompareEntry = {
  user_id: string
  display_name: string
  total_points: number
  correct_results: number
  rank: number
  total_players: number
  joker: { match: string; points: number | null } | null
}

type Groups = Record<string, string[]>

const STORAGE_KEY = 'tipovacka_compare_groups'

function loadGroups(): Groups {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveGroups(groups: Groups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
}

const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    background: 'linear-gradient(160deg, #0f1623 0%, #0a0f1a 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    width: '100%',
    maxWidth: 760,
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    padding: '20px 24px',
    overflowY: 'auto' as const,
    flex: 1,
  },
  label: {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  chip: (active: boolean, color = '#6366f1') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 99,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
    background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
    color: active ? color : 'rgba(255,255,255,0.5)',
    transition: 'all 0.15s',
  }),
}

export default function CompareModal({ players, asCard }: { players: Player[], asCard?: boolean }) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<Groups>({})
  const [selected, setSelected] = useState<string[]>([])
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [savingGroup, setSavingGroup] = useState(false)
  const [search, setSearch] = useState('')
  const [compareData, setCompareData] = useState<CompareEntry[]>([])
  const [loading, startTransition] = useTransition()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setGroups(loadGroups())
    }
  }, [open])

  useEffect(() => {
    if (selected.length === 0) {
      setCompareData([])
      return
    }
    startTransition(async () => {
      const res = await fetch(`/api/compare?ids=${selected.join(',')}`)
      const data = await res.json()
      setCompareData(data)
    })
  }, [selected])

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

  const filteredPlayers = search.length > 1
    ? players.filter(p =>
        normalize(p.display_name).includes(normalize(search)) &&
        !selected.includes(p.user_id)
      )
    : []

  function togglePlayer(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setSearch('')
    setActiveGroup(null)
  }

  function applyGroup(name: string) {
    const ids = groups[name] ?? []
    setSelected(ids)
    setActiveGroup(name)
  }

  function saveCurrentGroup() {
    if (!newGroupName.trim() || selected.length === 0) return
    const updated = { ...groups, [newGroupName.trim()]: selected }
    setGroups(updated)
    saveGroups(updated)
    setNewGroupName('')
    setSavingGroup(false)
  }

  function deleteGroup(name: string) {
    const updated = { ...groups }
    delete updated[name]
    setGroups(updated)
    saveGroups(updated)
    if (activeGroup === name) setActiveGroup(null)
  }

  const selectedData = [...(compareData ?? [])].sort((a, b) => a.rank - b.rank)

  return (
    <>
      {asCard ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: 20, padding: '20px 22px', cursor: 'pointer', textAlign: 'left',
            width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: 14, top: 10, fontSize: '3.5rem', opacity: 0.18, userSelect: 'none' }}>⚖️</div>
          <p style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.7)', marginBottom: 10 }}>Porovnat</p>
          <p style={{ fontSize: '2.8rem', fontWeight: 900, color: '#818cf8', lineHeight: 1, letterSpacing: '-0.02em' }}>vs</p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(99,102,241,0.45)', marginTop: 6, fontWeight: 600 }}>s ostatními hráči →</p>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 12,
            padding: '8px 16px',
            color: '#a78bfa',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          ⚖️ Porovnat hráče
        </button>
      )}

      {open && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div style={S.modal}>
            {/* Header */}
            <div style={S.header}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>⚖️ Porovnat hráče</span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}
              >
                ×
              </button>
            </div>

            <div style={S.body}>
              {/* Skupiny */}
              {Object.keys(groups).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={S.label}>Moje skupiny</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.keys(groups).map(name => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => applyGroup(name)}
                          style={S.chip(activeGroup === name)}
                        >
                          {name}
                          <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({groups[name].length})</span>
                        </button>
                        <button
                          onClick={() => deleteGroup(name)}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 4px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vybraní hráči */}
              {selected.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={S.label}>Vybráno</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[...selected].sort((a, b) => {
                      const ra = compareData?.find(x => x.user_id === a)?.rank ?? players.findIndex(x => x.user_id === a)
                      const rb = compareData?.find(x => x.user_id === b)?.rank ?? players.findIndex(x => x.user_id === b)
                      return ra - rb
                    }).map(id => {
                      const p = players.find(x => x.user_id === id)
                      return (
                        <button
                          key={id}
                          onClick={() => togglePlayer(id)}
                          style={S.chip(true, '#34d399')}
                        >
                          {p?.display_name ?? id.slice(0, 8)}
                          <span style={{ opacity: 0.7 }}>×</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Hledat hráče */}
              <div style={{ marginBottom: 16 }}>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Přidat hráče..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {filteredPlayers.length > 0 && (
                  <div style={{
                    background: '#0f1623',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    marginTop: 4,
                  }}>
                    {filteredPlayers.map(p => (
                      <button
                        key={p.user_id}
                        onClick={() => togglePlayer(p.user_id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '10px 14px',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          color: '#e2e8f0',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.88rem',
                        }}
                      >
                        <span>{p.display_name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{p.total_points} b</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Uložit jako skupinu */}
              {selected.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  {savingGroup ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveCurrentGroup()}
                        placeholder="Název skupiny..."
                        autoFocus
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          padding: '7px 12px',
                          color: '#e2e8f0',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={saveCurrentGroup}
                        style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Uložit
                      </button>
                      <button
                        onClick={() => setSavingGroup(false)}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Zrušit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSavingGroup(true)}
                      style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      💾 Uložit jako skupinu
                    </button>
                  )}
                </div>
              )}

              {/* Porovnávací tabulka */}
              {selected.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                      Načítám...
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr>
                          <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>—</td>
                          {selectedData.map(e => (
                            <td key={e.user_id} style={{ padding: '8px 10px', textAlign: 'center', minWidth: 110 }}>
                              <Link
                                href={`/results/${e.user_id}`}
                                onClick={() => setOpen(false)}
                                style={{ color: '#a78bfa', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}
                              >
                                {e.display_name.split(' ')[0]}
                              </Link>
                              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: 2 }}>
                                {e.display_name.split(' ').slice(1).join(' ')}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            label: 'Pořadí',
                            render: (e: CompareEntry) => (
                              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#a78bfa' }}>
                                {e.rank}.
                              </span>
                            ),
                          },
                          {
                            label: 'Body',
                            render: (e: CompareEntry) => (
                              <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f59e0b' }}>
                                {e.total_points}
                              </span>
                            ),
                          },
                          {
                            label: 'Přesných tipů',
                            render: (e: CompareEntry) => (
                              <span style={{ fontWeight: 700, color: '#34d399' }}>
                                {e.correct_results}
                              </span>
                            ),
                          },
                          {
                            label: 'Žolík',
                            render: (e: CompareEntry) => e.joker ? (
                              <div>
                                <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem' }}>
                                  ⚡ {e.joker.match}
                                </div>
                                {e.joker.points !== null && (
                                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                                    {e.joker.points > 0 ? `+${e.joker.points} b` : 'odehráno'}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                            ),
                          },
                        ].map(row => (
                          <tr key={row.label} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 10px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {row.label}
                            </td>
                            {selectedData.map(e => (
                              <td key={e.user_id} style={{ padding: '12px 10px', textAlign: 'center' }}>
                                {row.render(e)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {selected.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                  Vyhledej nebo vyber skupinu hráčů pro porovnání
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
