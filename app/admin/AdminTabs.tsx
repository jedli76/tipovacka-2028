'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import ExportButton from './ExportButton'
import BonusAdmin from './bonuses/BonusAdmin'
import NewsAdmin from './news/NewsAdmin'
import QuestionRow from './bonuses/QuestionRow'
import ScorersAdmin from './scorers/ScorersAdmin'
import { addTournamentQuestion, saveBonusAnswer } from './bonuses/actions'

type Match = {
  id: string
  home_team: string
  away_team: string
  kickoff_at: string
  group_name: string | null
  stage: string
  home_score: number | null
  away_score: number | null
  col_index: number | null
}

type BonusQ = {
  id: string
  question: string
  correct_answer: string | null
  sort_order: number
  match_col_indices?: number[]
  points_per_correct: number
}

type TournamentQ = {
  id: string
  question: string
  category: string
  correct_answer: string | null
  points_per_correct: number
  sort_order: number
}

type NewsPost = {
  id: string
  title: string
  content: string
  cover_image_url: string | null
  cover_image_position: string | null
  published: boolean
  created_at: string
}

type Scorer = {
  name: string
  goals: number
  tip_count: number
  is_top: boolean
}

export default function AdminTabs({
  matches,
  bonusQuestions,
  tournamentQuestions,
  newsPosts,
  scorers,
  topBonusActive,
}: {
  matches: Match[]
  bonusQuestions: BonusQ[]
  tournamentQuestions: TournamentQ[]
  newsPosts: NewsPost[]
  scorers: Scorer[]
  topBonusActive: boolean
}) {
  const [tab, setTab] = useState<'matches' | 'news' | 'scorers'>('matches')
  const [addingNews, setAddingNews] = useState(false)
  const [addingBonus, setAddingBonus] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newCategory, setNewCategory] = useState('bonus')
  const [newPoints, setNewPoints] = useState('10')
  const [addErr, setAddErr] = useState('')
  const [addPending, startAddTransition] = useTransition()

  function submitNewQuestion() {
    if (!newQuestion.trim()) return
    setAddErr('')
    startAddTransition(async () => {
      const fd = new FormData()
      fd.append('question', newQuestion)
      fd.append('category', newCategory)
      fd.append('points', newPoints)
      const res = await addTournamentQuestion(fd)
      if (res.error) {
        setAddErr(res.error)
      } else {
        setAddingBonus(false)
        setNewQuestion('')
        setNewCategory('bonus')
        setNewPoints('10')
      }
    })
  }

  const tabBtn = (t: 'matches' | 'news' | 'scorers', label: string, count: number) => (
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
          {tabBtn('matches', '⚽ Zápasy & bonusovky', matches.length)}
          {tabBtn('scorers', '🎯 Střelci', scorers.length)}
          {tabBtn('news', '📰 Novinky', newsPosts.length)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tab === 'matches' && (
            <>
              <Link
                href="/admin/matches/new"
                style={{ background: '#22c55e', color: '#000', fontWeight: 700, padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: '0.9rem' }}
              >
                + Přidat zápas
              </Link>
              <button
                onClick={() => setAddingBonus(true)}
                style={{ background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                + Přidat otázku
              </button>
            </>
          )}
          {tab === 'scorers' && (
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
              Za každý gól střelce +10 b tipujícímu
            </div>
          )}
          {tab === 'news' && (
            <button
              onClick={() => setAddingNews(true)}
              style={{ background: '#4f46e5', color: '#fff', fontWeight: 700, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              + Nový příspěvek
            </button>
          )}
        </div>
      </div>

      {/* Zápasy */}
      {tab === 'matches' && (() => {
        const colToBonusQ: Record<number, typeof bonusQuestions[0]> = {}
        for (const bq of bonusQuestions) {
          for (const ci of (bq.match_col_indices ?? [])) {
            colToBonusQ[ci] = bq
          }
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {matches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>Žádné zápasy.</div>
            ) : matches.map(m => {
              const bq = m.col_index != null ? colToBonusQ[m.col_index] : undefined
              return (
                <div key={m.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  {bq && (
                    <QuestionRow key={bq.id} q={bq} table="bonus_questions" onSave={saveBonusAnswer} compact />
                  )}
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* Turnajové bonusové otázky (součást záložky Zápasy) */}
      {tab === 'matches' && tournamentQuestions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>🏆 Turnajové bonusové otázky</div>
          <BonusAdmin tournamentQuestions={tournamentQuestions} />
        </div>
      )}

      {/* Střelci */}
      {tab === 'scorers' && <ScorersAdmin scorers={scorers} topBonusActive={topBonusActive} />}

      {/* Novinky */}
      {tab === 'news' && (
        <NewsAdmin
          posts={newsPosts}
          forceAddOpen={addingNews}
          onAddClose={() => setAddingNews(false)}
        />
      )}

      {/* Modal pro přidání otázky */}
      {addingBonus && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setAddingBonus(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div style={{ background: 'linear-gradient(160deg, #0f1623 0%, #0a0f1a 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 520, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Nová bonusová otázka</span>
              <button onClick={() => setAddingBonus(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Zadání / otázka</label>
                <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Text otázky..." autoFocus style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Kategorie</label>
                  <select
                    value={newCategory}
                    onChange={e => {
                      setNewCategory(e.target.value)
                      if (e.target.value === 'bonus_small') setNewPoints('3')
                      else if (e.target.value === 'bonus') setNewPoints('10')
                      else if (e.target.value === 'group_advancement') setNewPoints('10')
                    }}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="bonus">Velký bonus</option>
                    <option value="bonus_small">Malá bonusovka</option>
                    <option value="group_advancement">Postupující ze skupin</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Body za správnou odpověď</label>
                  <input type="number" value={newPoints} onChange={e => setNewPoints(e.target.value)} min="1" style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
            {addErr && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 10 }}>{addErr}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={submitNewQuestion} disabled={addPending || !newQuestion.trim()} style={{ background: '#4f46e5', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', opacity: addPending ? 0.6 : 1 }}>
                {addPending ? 'Ukládám...' : 'Přidat otázku'}
              </button>
              <button onClick={() => setAddingBonus(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
