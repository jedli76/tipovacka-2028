export type HofTip = {
  user_id: string
  home_score: number
  away_score: number
  points: number | null
  kickoff_at: string
  match_id: string
  match_home_score: number | null
  match_away_score: number | null
}

export type HofEntry = {
  user_id: string
  display_name: string
  value: number
}

export type HofCategory = {
  leader: HofEntry
  top10: HofEntry[]
}

export type HallOfFame = {
  topMatchPoints: HofCategory | null
  mostExact: HofCategory | null
  bestStreak: HofCategory | null
  currentStreak: HofCategory | null
  currentZeroStreak: HofCategory | null
  hotStreak: HofCategory | null
  nearMiss: HofCategory | null
}

function topN(map: Record<string, number>, names: Record<string, string>, n = 10): HofEntry[] {
  return Object.entries(map)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([uid, val]) => ({ user_id: uid, display_name: names[uid] ?? '–', value: val }))
}

function toCategory(entries: HofEntry[]): HofCategory | null {
  if (!entries.length) return null
  return { leader: entries[0], top10: entries }
}

export function computeHallOfFame(
  tips: HofTip[],
  names: Record<string, string>,
  last8MatchIds: Set<string>,
): HallOfFame {
  const played = tips.filter(t => t.match_home_score !== null && t.match_away_score !== null)

  const byUser: Record<string, HofTip[]> = {}
  for (const t of played) {
    ;(byUser[t.user_id] ??= []).push(t)
  }
  for (const uid in byUser) {
    byUser[uid].sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())
  }

  const matchPtsMap: Record<string, number> = {}
  const exactMap: Record<string, number> = {}
  const nearMap: Record<string, number> = {}
  const hotMap: Record<string, number> = {}

  for (const t of played) {
    const isExact = t.home_score === t.match_home_score && t.away_score === t.match_away_score
    const dh = Math.abs(t.home_score - (t.match_home_score ?? 0))
    const da = Math.abs(t.away_score - (t.match_away_score ?? 0))

    matchPtsMap[t.user_id] = (matchPtsMap[t.user_id] ?? 0) + (t.points ?? 0)
    if (isExact) exactMap[t.user_id] = (exactMap[t.user_id] ?? 0) + 1
    if (!isExact && dh + da === 1) nearMap[t.user_id] = (nearMap[t.user_id] ?? 0) + 1
    if (last8MatchIds.has(t.match_id)) hotMap[t.user_id] = (hotMap[t.user_id] ?? 0) + (t.points ?? 0)
  }

  // Streaks
  const bestStreakMap: Record<string, number> = {}
  const curStreakMap: Record<string, number> = {}
  const zeroStreakMap: Record<string, number> = {}

  for (const [uid, utips] of Object.entries(byUser)) {
    let cur = 0, bestVal = 0
    for (const t of utips) {
      const isExact = t.home_score === t.match_home_score && t.away_score === t.match_away_score
      cur = isExact ? cur + 1 : 0
      if (cur > bestVal) bestVal = cur
    }
    if (bestVal > 0) bestStreakMap[uid] = bestVal

    let curExact = 0
    for (let i = utips.length - 1; i >= 0; i--) {
      if (utips[i].home_score === utips[i].match_home_score && utips[i].away_score === utips[i].match_away_score) curExact++
      else break
    }
    if (curExact > 0) curStreakMap[uid] = curExact

    let curZero = 0
    for (let i = utips.length - 1; i >= 0; i--) {
      if ((utips[i].points ?? 0) === 0) curZero++; else break
    }
    if (curZero > 0) zeroStreakMap[uid] = curZero
  }

  return {
    topMatchPoints: toCategory(topN(matchPtsMap, names)),
    mostExact: toCategory(topN(exactMap, names)),
    bestStreak: toCategory(topN(bestStreakMap, names)),
    currentStreak: toCategory(topN(curStreakMap, names)),
    currentZeroStreak: toCategory(topN(zeroStreakMap, names)),
    hotStreak: toCategory(topN(hotMap, names)),
    nearMiss: toCategory(topN(nearMap, names)),
  }
}
