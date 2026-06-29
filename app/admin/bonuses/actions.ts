'use server'

import { createClient } from '@/lib/supabase/server'

async function updateLeaderboardForUsers(supabase: any, userIds: string[]) {
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
      supabase.from('bonus_tips').select('points').eq('user_id', userId),
      supabase.from('tournament_tips').select('points').eq('user_id', userId),
    ])

    const matchPoints = userTips?.reduce((s: number, t: { points: number }) => s + (t.points ?? 0), 0) ?? 0
    const bonusPoints = userBonusTips?.reduce((s: number, t: { points: number }) => s + (t.points ?? 0), 0) ?? 0
    const tournamentPoints = userTournamentTips?.reduce((s: number, t: { points: number }) => s + (t.points ?? 0), 0) ?? 0

    const correctResults = userTips?.filter((t: any) =>
      t.matches?.home_score === t.home_score && t.matches?.away_score === t.away_score
    ).length ?? 0

    await supabase.from('leaderboard').upsert({
      user_id: userId,
      total_points: matchPoints + bonusPoints + tournamentPoints,
      correct_results: correctResults,
      tips_count: userTips?.length ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }
}

// Uloží správnou odpověď na bonus_question a přepočítá body
export async function saveBonusAnswer(questionId: string, correctAnswer: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return { error: 'Přístup odepřen.' }

  const { error } = await supabase
    .from('bonus_questions')
    .update({ correct_answer: correctAnswer })
    .eq('id', questionId)

  if (error) return { error: error.message }

  // Přepočítej body — 1 bod za správnou odpověď (přesná shoda)
  const { data: tips } = await supabase
    .from('bonus_tips')
    .select('id, user_id, answer')
    .eq('question_id', questionId)

  if (!tips?.length) return {}

  for (const tip of tips) {
    const isCorrect = tip.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    // Zjisti max body z otázky
    const { data: q } = await supabase
      .from('bonus_questions')
      .select('points_per_correct')
      .eq('id', questionId)
      .single()
    const pts = isCorrect ? (q?.points_per_correct ?? 10) : 0
    await supabase.from('bonus_tips').update({ points: pts }).eq('id', tip.id)
  }

  const userIds = [...new Set(tips.map((t: { user_id: string }) => t.user_id))]
  await updateLeaderboardForUsers(supabase, userIds)
  return {}
}

// Uloží správnou odpověď na tournament_question a přepočítá body
export async function saveTournamentAnswer(questionId: string, correctAnswer: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return { error: 'Přístup odepřen.' }

  const { data: q, error: qErr } = await supabase
    .from('tournament_questions')
    .update({ correct_answer: correctAnswer })
    .eq('id', questionId)
    .select('category, points_per_correct')
    .single()

  if (qErr) return { error: qErr.message }

  const { data: tips } = await supabase
    .from('tournament_tips')
    .select('id, user_id, answer')
    .eq('question_id', questionId)

  if (!tips?.length) return {}

  const ptsPerCorrect = q?.points_per_correct ?? 10

  for (const tip of tips) {
    let pts = 0
    if (q?.category === 'group_advancement') {
      // Odpověď je "Tým1, Tým2" — 10 bodů za každý správný tým
      const correct = correctAnswer.split(',').map((s: string) => s.trim().toLowerCase())
      const tipTeams = tip.answer.split(',').map((s: string) => s.trim().toLowerCase())
      pts = tipTeams.filter((t: string) => correct.includes(t)).length * ptsPerCorrect
    } else {
      const isCorrect = tip.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
      pts = isCorrect ? ptsPerCorrect : 0
    }
    await supabase.from('tournament_tips').update({ points: pts }).eq('id', tip.id)
  }

  const userIds = [...new Set(tips.map((t: { user_id: string }) => t.user_id))]
  await updateLeaderboardForUsers(supabase, userIds)
  return {}
}
