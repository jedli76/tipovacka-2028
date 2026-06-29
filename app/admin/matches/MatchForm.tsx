'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveMatch, deleteMatch } from './actions'

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

const STAGES = [
  { value: 'group', label: 'Skupinová fáze' },
  { value: 'round_of_16', label: 'Osmifinále' },
  { value: 'quarter', label: 'Čtvrtfinále' },
  { value: 'semi', label: 'Semifinále' },
  { value: 'final', label: 'Finále' },
]

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function MatchForm({ match }: { match?: Match }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [homeTeam, setHomeTeam] = useState(match?.home_team ?? '')
  const [awayTeam, setAwayTeam] = useState(match?.away_team ?? '')
  const [kickoff, setKickoff] = useState(match ? toLocalDatetimeValue(match.kickoff_at) : '')
  const [stage, setStage] = useState(match?.stage ?? 'group')
  const [groupName, setGroupName] = useState(match?.group_name ?? '')
  const [homeScore, setHomeScore] = useState(match?.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState(match?.away_score?.toString() ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const result = await saveMatch({
        id: match?.id,
        homeTeam,
        awayTeam,
        kickoffAt: new Date(kickoff).toISOString(),
        stage,
        groupName: stage === 'group' ? groupName : null,
        homeScore: homeScore !== '' ? parseInt(homeScore) : null,
        awayScore: awayScore !== '' ? parseInt(awayScore) : null,
      })

      if (result.error) {
        setError(result.error)
      } else {
        window.location.href = '/admin'
      }
    })
  }

  function handleDelete() {
    if (!match) return
    if (!confirm('Smazat tento zápas? Smažou se i všechny tipy.')) return
    startTransition(async () => {
      await deleteMatch(match.id)
      router.push('/admin')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Domácí tým</label>
          <input
            value={homeTeam}
            onChange={e => setHomeTeam(e.target.value)}
            required
            placeholder="např. Česko"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Hostující tým</label>
          <input
            value={awayTeam}
            onChange={e => setAwayTeam(e.target.value)}
            required
            placeholder="např. Slovensko"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Výkop</label>
        <input
          type="datetime-local"
          value={kickoff}
          onChange={e => setKickoff(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Fáze</label>
          <select
            value={stage}
            onChange={e => setStage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
          >
            {STAGES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        {stage === 'group' && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Skupina</label>
            <select
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="">Vyberte skupinu</option>
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 pt-5">
        <p className="text-sm text-gray-400 mb-3">Výsledek (vyplňte po odehrání zápasu)</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={99}
            value={homeScore}
            onChange={e => setHomeScore(e.target.value)}
            placeholder="–"
            className="w-16 text-center bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-lg font-bold focus:outline-none focus:border-green-500"
          />
          <span className="text-gray-500 font-bold text-xl">:</span>
          <input
            type="number"
            min={0}
            max={99}
            value={awayScore}
            onChange={e => setAwayScore(e.target.value)}
            placeholder="–"
            className="w-16 text-center bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-lg font-bold focus:outline-none focus:border-green-500"
          />
          <span className="text-sm text-gray-500 ml-2">(po zadání výsledku se automaticky přepočítají body)</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-lg transition-colors"
        >
          {isPending ? 'Ukládám...' : match ? 'Uložit změny' : 'Vytvořit zápas'}
        </button>
        {match && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-400 hover:text-red-300 text-sm px-4 py-2.5 transition-colors"
          >
            Smazat zápas
          </button>
        )}
        <a href="/admin" className="text-gray-400 hover:text-white text-sm px-4 py-2.5 transition-colors">
          Zrušit
        </a>
      </div>
    </form>
  )
}
