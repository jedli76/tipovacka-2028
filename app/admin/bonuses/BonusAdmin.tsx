'use client'

import { useState, useTransition } from 'react'
import { saveBonusAnswer, saveTournamentAnswer, addTournamentQuestion, saveQuestionText } from './actions'

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
  table,
}: {
  q: { id: string; question: string; correct_answer: string | null }
  onSave: (id: string, answer: string) => Promise<{ error?: string }>
  table: 'bonus_questions' | 'tournament_questions'
}) {
  const [editing, setEditing] = useState(false)
  const [answer, setAnswer] = useState(q.correct_answer ?? '')
  const [questionText, setQuestionText] = useState(q.question)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [pending, startTransition] = useTransition()

  const inputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '7px 12px',
    color: '#e2e8f0',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  function save() {
    setErr('')
    startTransition(async () => {
      const results = await Promise.all([
        questionText.trim() !== q.question ? saveQuestionText(table, q.id, questionText) : Promise.resolve<{ error?: string }>({}),
        answer.trim() ? onSave(q.id, answer.trim()) : Promise.resolve<{ error?: string }>({}),
      ])
      const error = results.find(r => r.error)?.error
      if (error) {
        setErr(error)
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
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Zadání / otázka</label>
            <input value={questionText} onChange={e => setQuestionText(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Správná odpověď</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} placeholder="Správná odpověď..." style={inputStyle} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button onClick={save} disabled={pending} style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', opacity: pending ? 0.6 : 1 }}>
              {pending ? '...' : 'Uložit'}
            </button>
            <button onClick={() => { setEditing(false); setAnswer(q.correct_answer ?? ''); setQuestionText(q.question) }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Zrušit
            </button>
          </div>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 8 }}>{q.question}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: hasAnswer ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
              {saved ? '✓ Uloženo' : hasAnswer ? `✓ ${q.correct_answer}` : 'Bez odpovědi'}
            </span>
            <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              Upravit
            </button>
          </div>
        </>
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
  const bigBonuses = tournamentQuestions.filter(q => q.category === 'bonus' || q.category === 'bonus_small')
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
              <QuestionRow key={q.id} q={q} onSave={saveBonusAnswer} table="bonus_questions" />
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
              <QuestionRow key={q.id} q={q} onSave={saveTournamentAnswer} table="tournament_questions" />
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
              <QuestionRow key={q.id} q={q} onSave={saveTournamentAnswer} table="tournament_questions" />
            ))}
          </div>
        </div>
      )}

      {/* Přidat novou otázku — inline tlačítko pro přidání (záložní) */}
      <AddQuestionForm />
    </div>
  )
}

function AddQuestionForm({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  const isOpen = forceOpen || open

  function close() {
    setOpen(false)
    onClose?.()
  }
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setErr('')
    startTransition(async () => {
      const res = await addTournamentQuestion(formData)
      if (res.error) {
        setErr(res.error)
      } else {
        setOk(true)
        close()
        setTimeout(() => setOk(false), 3000)
      }
    })
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#e2e8f0',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ marginTop: 16 }}>
      {!isOpen ? (
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px dashed rgba(99,102,241,0.4)', borderRadius: 12, padding: '12px 20px', color: '#a5b4fc', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', width: '100%' }}
        >
          + Přidat novou otázku
        </button>
      ) : (
        <form action={submit} style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: '16px' }}>
          <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: 14, fontSize: '0.9rem' }}>Nová bonusová otázka</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Otázka</label>
              <input name="question" required placeholder="Text otázky..." style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Kategorie</label>
                <select name="category" style={{ ...inputStyle }}>
                  <option value="bonus">Velký bonus</option>
                  <option value="group_advancement">Postupující ze skupin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Body za správnou odpověď</label>
                <input name="points" type="number" defaultValue="10" min="1" style={inputStyle} />
              </div>
            </div>
          </div>
          {err && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 8 }}>{err}</p>}
          {ok && <p style={{ color: '#34d399', fontSize: '0.78rem', marginTop: 8 }}>✓ Otázka přidána</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button type="submit" disabled={pending} style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '9px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', opacity: pending ? 0.6 : 1 }}>
              {pending ? 'Ukládám...' : 'Přidat otázku'}
            </button>
            <button type="button" onClick={close} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 14px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.88rem' }}>
              Zrušit
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
