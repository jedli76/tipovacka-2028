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

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true })

  const { data: tips } = await supabase
    .from('tips')
    .select('*')
    .eq('user_id', id)

  const { data: bonusQuestions, error: bqError } = await supabase
    .from('bonus_questions')
    .select('*')
    .order('sort_order')

  const { data: bonusTips, error: btError } = await supabase
    .from('bonus_tips')
    .select('question_id, answer, points')
    .eq('user_id', id)

  return (
    <ResultsView
      displayName={profile.display_name}
      matches={matches ?? []}
      tips={tips ?? []}
      bonusQuestions={bonusQuestions ?? []}
      bonusTips={bonusTips ?? []}
      backHref="/leaderboard"
      backLabel="Žebříček"
    />
  )
}
