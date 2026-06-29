'use client'

import { useState, useTransition } from 'react'
import { saveTip } from './actions'
import { teamWithFlag } from '@/lib/flags'
import TeamName from '@/lib/TeamName'

type Match = {
  id: string
  home_team: string
  away_team: string
  kickoff_at: string
  stage: string
  group_name: string | null
  home_score: number | null
  away_score: number | null
}

type Tip = {
  match_id: string
  home_score: number
  away_score: number
  is_joker: boolean
  points: number | null
}

type Props = {
  matches: Match[]
  tipsMap: Record<string, Tip>
  jokerUsed: boolean
  userId: string
  isClosed: boolean
}

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupMatches(matches: Match[]) {
  const groups: Record<string, Match[]> = {}
  for (const m of matches) {
    const key = m.stage === 'group' ? `Skupina ${m.group_name ?? '?'}` : stageLabel(m.stage)
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  }
  return groups
}

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    round_of_16: 'Osmifinále',
    quarter: 'Čtvrtfinále',
    semi: 'Semifinále',
    final: 'Finále',
  }
  return labels[stage] ?? stage
}

export default function TipsForm({ matches, tipsMap, jokerUsed, userId, isClosed }: Props) {
  const [tips, setTips] = useState<Record<string, { home: string; away: string; joker: boolean }>>(
    () => Object.fromEntries(
      matches.map(m => [
        m.id,
        {
          home: tipsMap[m.id]?.home_score?.toString() ?? '',
          away: tipsMap[m.id]?.away_score?.toString() ?? '',
          joker: tipsMap[m.id]?.is_joker ?? false,
        },
      ])
    )
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const currentJoker = Object.entries(tips).find(([, t]) => t.joker)?.[0]

  function setScore(matchId: string, side: 'home' | 'away', value: string) {
    if (value !== '' && (!/^\d+$/.test(value) || parseInt(value) > 99)) return
    setTips(prev => ({ ...prev, [matchId]: { ...prev[matchId], [side]: value } }))
    setSaved(prev => ({ ...prev, [matchId]: false }))
  }

  function toggleJoker(matchId: string) {
    setTips(prev => {
      const next = { ...prev }
      // Odstraň joker odjinud
      for (const id in next) {
        if (id !== matchId) next[id] = { ...next[id], joker: false }
      }
      next[matchId] = { ...next[matchId], joker: !next[matchId].joker }
      return next
    })
    setSaved(prev => ({ ...prev, [matchId]: false }))
  }

  async function handleSave(matchId: string) {
    const tip = tips[matchId]
    if (tip.home === '' || tip.away === '') {
      setErrors(prev => ({ ...prev, [matchId]: 'Vyplňte oba výsledky.' }))
      return
    }
    setErrors(prev => ({ ...prev, [matchId]: '' }))
    setSaving(matchId)

    startTransition(async () => {
      const result = await saveTip({
        userId,
        matchId,
        homeScore: parseInt(tip.home),
        awayScore: parseInt(tip.away),
        isJoker: tip.joker,
      })

      setSaving(null)
      if (result.error) {
        setErrors(prev => ({ ...prev, [matchId]: result.error! }))
      } else {
        setSaved(prev => ({ ...prev, [matchId]: true }))
      }
    })
  }

  const now = new Date()

  return (
    <div className="space-y-3">
      {matches.map(match => {
              const isLocked = isClosed
              const tip = tips[match.id]
              const isThisJoker = tip?.joker
              const canJoker = !jokerUsed || isThisJoker || (!currentJoker && !jokerUsed)
              const isSaving = saving === match.id
              const isSaved = saved[match.id]
              const error = errors[match.id]

              return (
                <div
                  key={match.id}
                  className={`bg-gray-900 rounded-xl p-4 border transition-colors ${
                    isThisJoker ? 'border-yellow-500/50' : 'border-gray-800'
                  } ${isLocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">{formatKickoff(match.kickoff_at)}</span>
                    {isLocked && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                        Uzavřeno
                      </span>
                    )}
                    {match.home_score !== null && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                        Výsledek: {match.home_score}:{match.away_score}
                      </span>
                    )}
                    {tipsMap[match.id]?.points !== null && tipsMap[match.id]?.points !== undefined && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded ml-auto">
                        +{tipsMap[match.id].points} b
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-right font-medium text-white"><TeamName team={match.home_team} flagSize="1.5em" /></span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={tip?.home ?? ''}
                        onChange={e => setScore(match.id, 'home', e.target.value)}
                        disabled={isLocked}
                        className="w-12 h-10 text-center bg-gray-800 border border-gray-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:border-green-500 disabled:cursor-not-allowed"
                        placeholder="–"
                      />
                      <span className="text-gray-500 font-bold">:</span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={tip?.away ?? ''}
                        onChange={e => setScore(match.id, 'away', e.target.value)}
                        disabled={isLocked}
                        className="w-12 h-10 text-center bg-gray-800 border border-gray-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:border-green-500 disabled:cursor-not-allowed"
                        placeholder="–"
                      />
                    </div>

                    <span className="flex-1 font-medium text-white"><TeamName team={match.away_team} flagSize="1.5em" /></span>

                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => toggleJoker(match.id)}
                        disabled={isLocked || (!canJoker && !isThisJoker)}
                        title="Žolík — zdvojnásobí body za tento zápas"
                        className={`text-lg transition-opacity ${
                          isThisJoker ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                        } disabled:cursor-not-allowed`}
                      >
                        🃏
                      </button>

                      {!isLocked && (
                        <button
                          onClick={() => handleSave(match.id)}
                          disabled={isSaving || isPending}
                          className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            isSaved
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-green-500 hover:bg-green-400 text-black'
                          } disabled:opacity-50`}
                        >
                          {isSaving ? '...' : isSaved ? '✓ Uloženo' : 'Uložit'}
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs mt-2">{error}</p>
                  )}
                </div>
              )
      })}
    </div>
  )
}
