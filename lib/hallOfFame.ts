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

export type HallOfFame = {
  topMatchPoints: HofEntry | null
  mostExact: HofEntry | null
  bestStreak: HofEntry | null
  currentStreak: HofEntry | null
  currentZeroStreak: HofEntry | null
  hotStreak: HofEntry | null
  nearMiss: HofEntry | null
}

function best(map: Record<string, number>, names: Record<string, string>): HofEntry | null {
  const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0]
  return top && top[1] > 0 ? { user_id: top[0], display_name: names[top[0]] ?? '–', value: top[1] } : null
}

export function computeHallOfFame(
  tips: HofTip[],
  names: Record<string, string>,
  last8MatchIds: Set<string>,
): HallOfFame {
  const played = tips.filter(t => t.match_home_score !== null && t.match_away_score !== null)

  // Group by user, sorted by kickoff_at
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
  let bestStreakUser = '', bestStreakVal = 0
  let curStreakUser = '', curStreakVal = 0
  let zeroStreakUser = '', zeroStreakVal = 0

  for (const [uid, utips] of Object.entries(byUser)) {
    // Best ever streak
    let cur = 0, best2 = 0
    for (const t of utips) {
      const isExact = t.home_score === t.match_home_score && t.away_score === t.match_away_score
      cur = isExact ? cur + 1 : 0
      if (cur > best2) best2 = cur
    }
    if (best2 > bestStreakVal) { bestStreakVal = best2; bestStreakUser = uid }

    // Current exact streak
    let curExact = 0
    for (let i = utips.length - 1; i >= 0; i--) {
      const t = utips[i]
      if (t.home_score === t.match_home_score && t.away_score === t.match_away_score) curExact++
      else break
    }
    if (curExact > curStreakVal) { curStreakVal = curExact; curStreakUser = uid }

    // Current zero streak
    let curZero = 0
    for (let i = utips.length - 1; i >= 0; i--) {
      if ((utips[i].points ?? 0) === 0) curZero++; else break
    }
    if (curZero > zeroStreakVal) { zeroStreakVal = curZero; zeroStreakUser = uid }
  }

  return {
    topMatchPoints: best(matchPtsMap, names),
    mostExact: best(exactMap, names),
    bestStreak: bestStreakVal > 0 ? { user_id: bestStreakUser, display_name: names[bestStreakUser] ?? '–', value: bestStreakVal } : null,
    currentStreak: curStreakVal > 0 ? { user_id: curStreakUser, display_name: names[curStreakUser] ?? '–', value: curStreakVal } : null,
    currentZeroStreak: zeroStreakVal > 0 ? { user_id: zeroStreakUser, display_name: names[zeroStreakUser] ?? '–', value: zeroStreakVal } : null,
    hotStreak: best(hotMap, names),
    nearMiss: best(nearMap, names),
  }
}
