'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExportButton from './ExportButton'
import BonusAdmin from './bonuses/BonusAdmin'
import { saveBonusAnswer, saveTournamentAnswer, addTournamentQuestion } from './bonuses/actions'

type Match = {
  id: string
  home_team: string
  away_team: string
  kickoff_at: string
  group_name: string | null
  stage: string
  home_score: number | null
  away_score: number | null
}

type BonusQ = {
  id: string
  question: string
  correct_answer: string | null
  sort_order: number
}

type TournamentQ = {
  id: string
  question: string
  category: string
  correct_answer: string | null
  points_per_correct: number
  sort_order: number
}

export default function AdminTabs({
  matches,
  bonusQuestions,
  tournamentQuestions,
}: {
  matches: Match[]
  bonusQuestions: BonusQ[]
  tournamentQuestions: TournamentQ[]
}) {
  const [tab, setTab] = useState<'matches' | 'bonuses'>('matches')
  const [addingBonus, setAddingBonus] = useState(false)

  const tabBtn = (t: typeof tab, label: string, count: number) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '8px 20px',
        fontWeight: 700,
        fontSize: '0.9rem',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        background: tab === t ? '#4f46e5' : 'transparent',
        color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.15s',
      }}
    >
      {label}
      <span style={{
        background: tab === t ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
        borderRadius: 99,
        padding: '1px 8px',
        fontSize: '0.75rem',
      }}>{count}</span>
    </button>
  )

  return (
    <div>
      {/* Záložky + akce */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
          {tabBtn('matches', '⚽ Zápasy', matches.length)}
          {tabBtn('bonuses', '🎯 Bonusové otázky', bonusQuestions.length + tournamentQuestions.length)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ExportButton />
          {tab === 'matches' && (
            <Link
              href="/admin/matches/new"
              style={{ background: '#22c55e', color: '#000', fontWeight: 700, padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: '0.9rem' }}
            >
              + Přidat zápas
            </Link>
          )}
          {tab === 'bonuses' && (
            <button
              onClick={() => setAddingBonus(true)}
              style={{ background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              + Přidat otázku
            </button>
          )}
        </div>
      </div>

      {/* Zápasy */}
      {tab === 'matches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>Žádné zápasy.</div>
          ) : matches.map(m => (
            <div key={m.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>
                  {m.home_team} vs {m.away_team}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  {new Date(m.kickoff_at).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {m.group_name && ` · Skupina ${m.group_name}`}
                  {m.stage && m.stage !== 'group' && ` · ${m.stage}`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {m.home_score !== null ? (
                  <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>{m.home_score}:{m.away_score}</span>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>bez výsledku</span>
                )}
                <Link
                  href={`/admin/matches/${m.id}`}
                  style={{ color: '#60a5fa', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
                >
                  Upravit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bonusy */}
      {tab === 'bonuses' && (
        <BonusAdmin
          bonusQuestions={bonusQuestions}
          tournamentQuestions={tournamentQuestions}
          forceAddOpen={addingBonus}
          onAddClose={() => setAddingBonus(false)}
        />
      )}
    </div>
  )
}
