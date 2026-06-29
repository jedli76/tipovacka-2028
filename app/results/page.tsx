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

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true })

  const { data: myTips } = await supabase
    .from('tips')
    .select('*')
    .eq('user_id', user.id)

  const { data: bonusQuestions } = await supabase
    .from('bonus_questions')
    .select('*')
    .order('sort_order')

  const { data: bonusTips } = await supabase
    .from('bonus_tips')
    .select('question_id, answer, points')
    .eq('user_id', user.id)

  return (
    <ResultsView
      displayName={profile?.display_name ?? 'Moje výsledky'}
      matches={matches ?? []}
      tips={myTips ?? []}
      bonusQuestions={bonusQuestions ?? []}
      bonusTips={bonusTips ?? []}
      backHref="/dashboard"
      backLabel="Dashboard"
    />
  )
}
