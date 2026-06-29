'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateMatchPoints } from '@/lib/scoring'

type SaveTipInput = {
  userId: string
  matchId: string
  homeScore: number
  awayScore: number
  isJoker: boolean
}

export async function saveTip(input: SaveTipInput): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== input.userId) {
    return { error: 'Nejste přihlášeni.' }
  }

  // Zajisti že profil existuje (trigger mohl selhat při registraci)
  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Hráč',
  }, { onConflict: 'id', ignoreDuplicates: true })

  // Ověření globální uzávěrky (5 minut před prvním zápasem šampionátu)
  const { data: firstMatch } = await supabase
    .from('matches')
    .select('kickoff_at')
    .order('kickoff_at', { ascending: true })
    .limit(1)
    .single()

  if (firstMatch) {
    const deadline = new Date(firstMatch.kickoff_at).getTime() - 5 * 60 * 1000
    if (Date.now() >= deadline) {
      return { error: 'Uzávěrka tipů proběhla — tipy již nelze měnit.' }
    }
  }

  const { data: match } = await supabase
    .from('matches')
    .select('kickoff_at, home_score, away_score')
    .eq('id', input.matchId)
    .single()

  if (!match) return { error: 'Zápas nenalezen.' }

  // Pokud hráč nastavuje žolíka, ověř že ho nemá použitý jinde
  if (input.isJoker) {
    const { data: existingJoker } = await supabase
      .from('tips')
      .select('match_id')
      .eq('user_id', user.id)
      .eq('is_joker', true)
      .neq('match_id', input.matchId)
      .single()

    if (existingJoker) {
      return { error: 'Žolík už byl použit na jiný zápas.' }
    }
  }

  // Pokud zápas už má výsledek, spočítej body rovnou
  const points = (match.home_score !== null && match.away_score !== null)
    ? calculateMatchPoints(input.homeScore, input.awayScore, match.home_score, match.away_score, input.isJoker)
    : null

  const { error } = await supabase
    .from('tips')
    .upsert(
      {
        user_id: user.id,
        match_id: input.matchId,
        home_score: input.homeScore,
        away_score: input.awayScore,
        is_joker: input.isJoker,
        points,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,match_id' }
    )

  if (error) return { error: error.message }

  // Aktualizuj žebříček
  if (points !== null) {
    const { data: userTips } = await supabase
      .from('tips')
      .select('points, home_score, away_score, matches(home_score, away_score)')
      .eq('user_id', user.id)
      .not('points', 'is', null)

    const totalPoints = userTips?.reduce((sum, t) => sum + (t.points ?? 0), 0) ?? 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correctResults = userTips?.filter((t: any) =>
      t.matches?.home_score === t.home_score && t.matches?.away_score === t.away_score
    ).length ?? 0

    await supabase.from('leaderboard').upsert({
      user_id: user.id,
      total_points: totalPoints,
      correct_results: correctResults,
      tips_count: userTips?.length ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  return {}
}
