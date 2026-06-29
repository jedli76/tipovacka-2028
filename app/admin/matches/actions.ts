'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateMatchPoints } from '@/lib/scoring'

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
  if (!user || user.email !== process.env.ADMIN_EMAIL) return { error: 'Přístup odepřen.' }

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
  if (!user || user.email !== process.env.ADMIN_EMAIL) return

  await supabase.from('matches').delete().eq('id', id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculatePoints(supabase: any, matchId: string, homeScore: number, awayScore: number) {
  const { data: tips } = await supabase
    .from('tips')
    .select('id, user_id, home_score, away_score, is_joker')
    .eq('match_id', matchId)

  if (!tips || tips.length === 0) return

  for (const tip of tips) {
    const points = calculateMatchPoints(tip.home_score, tip.away_score, homeScore, awayScore, tip.is_joker)
    await supabase.from('tips').update({ points }).eq('id', tip.id)
  }

  const userIds = [...new Set(tips.map((t: { user_id: string }) => t.user_id))]
  for (const userId of userIds) {
    const [
      { data: userTips },
      { data: userBonusTips },
      { data: userTournamentTips },
    ] = await Promise.all([
      supabase
        .from('tips')
        .select('points, home_score, away_score, matches(home_score, away_score)')
        .eq('user_id', userId)
        .not('points', 'is', null),
      supabase
        .from('bonus_tips')
        .select('points')
        .eq('user_id', userId),
      supabase
        .from('tournament_tips')
        .select('points')
        .eq('user_id', userId),
    ])

    const matchPoints = userTips?.reduce((s: number, t: { points: number }) => s + (t.points ?? 0), 0) ?? 0
    const bonusPoints = userBonusTips?.reduce((s: number, t: { points: number }) => s + (t.points ?? 0), 0) ?? 0
    const tournamentPoints = userTournamentTips?.reduce((s: number, t: { points: number }) => s + (t.points ?? 0), 0) ?? 0
    const totalPoints = matchPoints + bonusPoints + tournamentPoints

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correctResults = userTips?.filter((t: any) =>
      t.matches?.home_score === t.home_score && t.matches?.away_score === t.away_score
    ).length ?? 0

    await supabase.from('leaderboard').upsert({
      user_id: userId,
      total_points: totalPoints,
      correct_results: correctResults,
      tips_count: userTips?.length ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }
}
