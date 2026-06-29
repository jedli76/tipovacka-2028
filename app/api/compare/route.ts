import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean) ?? []
  if (ids.length === 0) return NextResponse.json([])

  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('leaderboard')
    .select('user_id, total_points, correct_results, tips_count, profiles(display_name)')
    .in('user_id', ids)

  if (!entries) return NextResponse.json([])

  // Počet hráčů před každým (pro rank)
  const points = entries.map(e => e.total_points)
  const { data: rankData } = await supabase
    .from('leaderboard')
    .select('user_id, total_points')

  const { count: totalPlayers } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })

  // Joker pro každého hráče
  const { data: jokers } = await supabase
    .from('tips')
    .select('user_id, match_id, home_score, away_score, points, matches(home_team, away_team)')
    .in('user_id', ids)
    .eq('is_joker', true)

  const jokerMap: Record<string, { match: string; points: number | null }> = {}
  for (const j of jokers ?? []) {
    const m = j.matches as unknown as { home_team: string; away_team: string } | null
    if (m) {
      jokerMap[j.user_id] = {
        match: `${m.home_team.slice(0, 3).toUpperCase()}-${m.away_team.slice(0, 3).toUpperCase()}`,
        points: j.points,
      }
    }
  }

  const result = entries.map(e => {
    const rank = (rankData?.filter(r => r.total_points > e.total_points).length ?? 0) + 1
    return {
      user_id: e.user_id,
      display_name: (e.profiles as unknown as { display_name: string } | null)?.display_name ?? '–',
      total_points: e.total_points,
      correct_results: e.correct_results,
      tips_count: e.tips_count,
      rank,
      total_players: totalPlayers,
      joker: jokerMap[e.user_id] ?? null,
    }
  })

  // Zachovej pořadí dle vstupního ids
  result.sort((a, b) => ids.indexOf(a.user_id) - ids.indexOf(b.user_id))

  return NextResponse.json(result)
}
