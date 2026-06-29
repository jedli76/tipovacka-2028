import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResultsView from './ResultsView'

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const [
    { data: matches },
    { data: myTips },
    { data: bonusQuestions },
    { data: bonusTips },
    { data: tournamentQuestions },
    { data: tournamentTips },
    { data: myEntry },
  ] = await Promise.all([
    supabase.from('matches').select('*').order('kickoff_at', { ascending: true }),
    supabase.from('tips').select('*').eq('user_id', user.id),
    supabase.from('bonus_questions').select('*').order('sort_order'),
    supabase.from('bonus_tips').select('question_id, answer, points').eq('user_id', user.id),
    supabase.from('tournament_questions').select('*').order('sort_order'),
    supabase.from('tournament_tips').select('question_id, answer, points').eq('user_id', user.id),
    supabase.from('leaderboard').select('total_points').eq('user_id', user.id).single(),
  ])

  const [{ count: rankCount }, { count: totalPlayers }] = await Promise.all([
    supabase.from('leaderboard').select('*', { count: 'exact', head: true }).gt('total_points', myEntry?.total_points ?? 0),
    supabase.from('leaderboard').select('*', { count: 'exact', head: true }),
  ])

  return (
    <ResultsView
      displayName={profile?.display_name ?? 'Moje výsledky'}
      matches={matches ?? []}
      tips={myTips ?? []}
      bonusQuestions={bonusQuestions ?? []}
      bonusTips={bonusTips ?? []}
      tournamentQuestions={tournamentQuestions ?? []}
      tournamentTips={tournamentTips ?? []}
      rank={myEntry ? (rankCount ?? 0) + 1 : null}
      totalPlayers={totalPlayers}
      backHref="/dashboard"
      backLabel="Dashboard"
    />
  )
}
