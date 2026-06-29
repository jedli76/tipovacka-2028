import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ResultsView from '../ResultsView'

export default async function PlayerResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const [
    { data: matches },
    { data: tips },
    { data: bonusQuestions },
    { data: bonusTips },
    { data: tournamentQuestions },
    { data: tournamentTips },
    { data: entry },
  ] = await Promise.all([
    supabase.from('matches').select('*').order('kickoff_at', { ascending: true }),
    supabase.from('tips').select('*').eq('user_id', id),
    supabase.from('bonus_questions').select('*').order('sort_order'),
    supabase.from('bonus_tips').select('question_id, answer, points').eq('user_id', id),
    supabase.from('tournament_questions').select('*').order('sort_order'),
    supabase.from('tournament_tips').select('question_id, answer, points').eq('user_id', id),
    supabase.from('leaderboard').select('total_points').eq('user_id', id).single(),
  ])

  const [{ count: rankCount }, { count: totalPlayers }] = await Promise.all([
    supabase.from('leaderboard').select('*', { count: 'exact', head: true }).gt('total_points', entry?.total_points ?? 0),
    supabase.from('leaderboard').select('*', { count: 'exact', head: true }),
  ])

  return (
    <ResultsView
      displayName={profile.display_name}
      matches={matches ?? []}
      tips={tips ?? []}
      bonusQuestions={bonusQuestions ?? []}
      bonusTips={bonusTips ?? []}
      tournamentQuestions={tournamentQuestions ?? []}
      tournamentTips={tournamentTips ?? []}
      rank={entry ? (rankCount ?? 0) + 1 : null}
      totalPlayers={totalPlayers}
      backHref="/leaderboard"
      backLabel="Žebříček"
    />
  )
}
