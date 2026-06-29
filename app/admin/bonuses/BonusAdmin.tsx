'use client'

import { useState, useTransition } from 'react'
import { saveBonusAnswer, saveTournamentAnswer } from './actions'

type BonusQ = {
  id: string
  question: string
  correct_answer: string | null
  sort_order: number
  match_col_indices?: number[]
}

type TournamentQ = {
  id: string
  question: string
  category: string
  correct_answer: string | null
  points_per_correct: number
  sort_order: number
}

function QuestionRow({
  q,
  onSave,
}: {
  q: { id: string; question: string; correct_answer: string | null }
  onSave: (id: string, answer: string) => Promise<{ error?: string }>
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(q.correct_answer ?? '')
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [pending, startTransition] = useTransition()

  function save() {
    if (!value.trim()) return
    setErr('')
    startTransition(async () => {
      const res = await onSave(q.id, value.trim())
      if (res.error) {
        setErr(res.error)
      } else {
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  const hasAnswer = !!q.correct_answer

  return (
    <div style={{
      background: hasAnswer ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${hasAnswer ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 12,
      padding: '12px 14px',
    }}>
      <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 8 }}>{q.question}</p>
      {editing ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
            placeholder="Správná odpověď..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '7px 12px',
              color: '#e2e8f0',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            onClick={save}
            disabled={pending || !value.trim()}
            style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', opacity: pending ? 0.6 : 1 }}
          >
            {pending ? '...' : 'Uložit'}
          </button>
          <button
            onClick={() => { setEditing(false); setValue(q.correct_answer ?? '') }}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Zrušit
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: hasAnswer ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
            {saved ? '✓ Uloženo' : hasAnswer ? `✓ ${q.correct_answer}` : 'Bez odpovědi'}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {hasAnswer ? 'Změnit' : 'Zadat'}
          </button>
        </div>
      )}
      {err && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{err}</p>}
    </div>
  )
}

export default function BonusAdmin({
  bonusQuestions,
  tournamentQuestions,
}: {
  bonusQuestions: BonusQ[]
  tournamentQuestions: TournamentQ[]
}) {
  const bigBonuses = tournamentQuestions.filter(q => q.category === 'bonus')
  const groupAdv = tournamentQuestions.filter(q => q.category === 'group_advancement')

  const sectionStyle = { marginBottom: 40 }
  const sectionHeader = {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }

  return (
    <div>
      {/* Bonusy u zápasů */}
      {bonusQuestions.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionHeader}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            Bonusy u zápasů ({bonusQuestions.filter(q => q.correct_answer).length}/{bonusQuestions.length} vyplněno)
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bonusQuestions.map(q => (
              <QuestionRow key={q.id} q={q} onSave={saveBonusAnswer} />
            ))}
          </div>
        </div>
      )}

      {/* Velké turnajové bonusy */}
      {bigBonuses.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionHeader}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            Velké bonusy ({bigBonuses.filter(q => q.correct_answer).length}/{bigBonuses.length} vyplněno)
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bigBonuses.map(q => (
              <QuestionRow key={q.id} q={q} onSave={saveTournamentAnswer} />
            ))}
          </div>
        </div>
      )}

      {/* Postupující ze skupin */}
      {groupAdv.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionHeader}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            Postupující ze skupin ({groupAdv.filter(q => q.correct_answer).length}/{groupAdv.length} vyplněno)
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
            Formát: „Tým1, Tým2" — 10 bodů za každý správně tipovaný tým
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {groupAdv.map(q => (
              <QuestionRow key={q.id} q={q} onSave={saveTournamentAnswer} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
