'use client'

import { useState, useTransition } from 'react'
import { saveBonusAnswer, saveQuestionText } from './actions'

type Props = {
  q: { id: string; question: string; correct_answer: string | null; points_per_correct?: number }
  table: 'bonus_questions' | 'tournament_questions'
  onSave: (id: string, answer: string, points?: number) => Promise<{ error?: string }>
  compact?: boolean
}

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

export default function QuestionRow({ q, table, onSave, compact }: Props) {
  const [editing, setEditing] = useState(false)
  const [answer, setAnswer] = useState(q.correct_answer ?? '')
  const [questionText, setQuestionText] = useState(q.question)
  const [points, setPoints] = useState(q.points_per_correct ?? 3)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [pending, startTransition] = useTransition()

  const hasAnswer = !!q.correct_answer

  function save() {
    setErr('')
    startTransition(async () => {
      const results = await Promise.all([
        questionText.trim() !== q.question ? saveQuestionText(table, q.id, questionText) : Promise.resolve<{ error?: string }>({}),
        answer.trim() ? onSave(q.id, answer.trim(), points) : Promise.resolve<{ error?: string }>({}),
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

  if (compact) {
    return (
      <div style={{
        background: hasAnswer ? 'rgba(52,211,153,0.04)' : 'rgba(99,102,241,0.04)',
        border: `1px solid ${hasAnswer ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.15)'}`,
        borderRadius: 8,
        padding: '8px 12px',
        marginTop: 6,
      }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input value={questionText} onChange={e => setQuestionText(e.target.value)} style={{ ...inputStyle, fontSize: '0.8rem', padding: '5px 10px' }} placeholder="Text otázky" />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="Správná odpověď (více: oddělte čárkou)"
                autoFocus
                style={{ ...inputStyle, fontSize: '0.8rem', padding: '5px 10px', flex: 1 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <input
                  type="number"
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                  min={1}
                  style={{ ...inputStyle, width: 52, fontSize: '0.8rem', padding: '5px 8px', textAlign: 'center' }}
                  title="Body za správnou odpověď"
                />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>b</span>
              </div>
              <button onClick={save} disabled={pending} style={{ background: '#4f46e5', border: 'none', borderRadius: 6, padding: '5px 12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0, opacity: pending ? 0.6 : 1 }}>
                {pending ? '...' : 'Uložit'}
              </button>
              <button onClick={() => { setEditing(false); setAnswer(q.correct_answer ?? ''); setQuestionText(q.question); setPoints(q.points_per_correct ?? 3) }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 10px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>
                Zrušit
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              Více správných odpovědí oddělte čárkou, např.: <em>JAR, MEX</em>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, flexShrink: 0 }}>🎯</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', flex: 1, minWidth: 0 }}>{q.question}</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', flexShrink: 0, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '1px 6px' }}>
              {points} b
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: hasAnswer ? '#34d399' : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
              {saved ? '✓' : hasAnswer ? `✓ ${q.correct_answer}` : 'bez odpovědi'}
            </span>
            <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}>
              Upravit
            </button>
          </div>
        )}
        {err && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{err}</p>}
      </div>
    )
  }

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
            <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              Správná odpověď <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(více odpovědí oddělte čárkou)</span>
            </label>
            <input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} placeholder="např. JAR nebo JAR, MEX" style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Body za správnou odpověď</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} min={1} style={{ ...inputStyle, width: 80 }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>bodů</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button onClick={save} disabled={pending} style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', opacity: pending ? 0.6 : 1 }}>
              {pending ? '...' : 'Uložit'}
            </button>
            <button onClick={() => { setEditing(false); setAnswer(q.correct_answer ?? ''); setQuestionText(q.question); setPoints(q.points_per_correct ?? 3) }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Zrušit
            </button>
          </div>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 8 }}>{q.question}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: hasAnswer ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
                {saved ? '✓ Uloženo' : hasAnswer ? `✓ ${q.correct_answer}` : 'Bez odpovědi'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 8px' }}>
                {points} b
              </span>
            </div>
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

export { saveBonusAnswer }
