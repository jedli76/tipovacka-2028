'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateMatchPoints } from '@/lib/scoring'
import { isAdmin } from '@/lib/admins'

type SaveMatchInput = {
  id?: string
  homeTeam: string
  awayTeam: string
  kickoffAt: string
  stage: string
  groupName: string | null
  homeScore: number | null
  awayScore: number | null
}

export async function saveMatch(input: SaveMatchInput): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return { error: 'Přístup odepřen.' }

  const payload = {
    home_team: input.homeTeam,
    away_team: input.awayTeam,
    kickoff_at: input.kickoffAt,
    stage: input.stage,
    group_name: input.groupName,
    home_score: input.homeScore,
    away_score: input.awayScore,
  }

  let matchId = input.id

  if (matchId) {
    const { error } = await supabase.from('matches').update(payload).eq('id', matchId)
    if (error) return { error: error.message }
  } else {
    const { data, error } = await supabase.from('matches').insert(payload).select('id').single()
    if (error) return { error: error.message }
    matchId = data.id
  }

  if (input.homeScore !== null && input.awayScore !== null) {
    await recalculatePoints(supabase, matchId!, input.homeScore, input.awayScore)
  }

  return {}
}

export async function deleteMatch(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return

  await supabase.from('matches').delete().eq('id', id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculatePoints(supabase: any, matchId: string, homeScore: number, awayScore: number) {
  const { data: tips } = await supabase
    .from('tips')
    .select('id, user_id, home_score, away_score, is_joker')
    .eq('match_id', matchId)

  if (!tips || tips.length === 0) return

  const exactCount = tips.filter(
    (t: { home_score: number; away_score: number }) =>
      t.home_score === homeScore && t.away_score === awayScore
  ).length
  const braveBase = exactCount <= 5 ? 15 : 0

  // Aktualizuj všechny tipy paralelně
  await Promise.all(tips.map((tip: { id: string; home_score: number; away_score: number; is_joker: boolean }) => {
    const points = calculateMatchPoints(tip.home_score, tip.away_score, homeScore, awayScore, tip.is_joker)
    const isExact = tip.home_score === homeScore && tip.away_score === awayScore
    const brave_bonus = isExact && braveBase > 0 ? braveBase : 0
    return supabase.from('tips').update({ points, brave_bonus }).eq('id', tip.id)
  }))

  const userIds = [...new Set(tips.map((t: { user_id: string }) => t.user_id))]

  // Načti data pro všechny hráče najednou
  const [
    { data: allUserTips },
    { data: allBonusTips },
    { data: allTournamentTips },
  ] = await Promise.all([
    supabase
      .from('tips')
      .select('user_id, points, brave_bonus, home_score, away_score, matches(home_score, away_score)')
      .in('user_id', userIds)
      .not('points', 'is', null),
    supabase.from('bonus_tips').select('user_id, points').in('user_id', userIds),
    supabase.from('tournament_tips').select('user_id, points').in('user_id', userIds),
  ])

  // Sestavuj leaderboard záznamy pro všechny uživatele najednou
  const upsertRows = (userIds as string[]).map((userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uTips = (allUserTips ?? []).filter((t: any) => t.user_id === userId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uBonus = (allBonusTips ?? []).filter((t: any) => t.user_id === userId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uTournament = (allTournamentTips ?? []).filter((t: any) => t.user_id === userId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchPoints = uTips.reduce((s: number, t: any) => s + (t.points ?? 0) + (t.brave_bonus ?? 0), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bonusPoints = uBonus.reduce((s: number, t: any) => s + (t.points ?? 0), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tournamentPoints = uTournament.reduce((s: number, t: any) => s + (t.points ?? 0), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correctResults = uTips.filter((t: any) =>
      t.matches?.home_score === t.home_score && t.matches?.away_score === t.away_score
    ).length

    return {
      user_id: userId,
      total_points: matchPoints + bonusPoints + tournamentPoints,
      correct_results: correctResults,
      tips_count: uTips.length,
      updated_at: new Date().toISOString(),
    }
  })

  // Jeden hromadný upsert pro všechny hráče
  await supabase.from('leaderboard').upsert(upsertRows, { onConflict: 'user_id' })
}
