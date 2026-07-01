'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admins'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function checkAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdmin(user?.email)
}

export async function addTournamentQuestion(formData: FormData): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }

  const question = formData.get('question') as string
  const category = formData.get('category') as string
  const points = parseInt(formData.get('points') as string) || 10

  if (!question?.trim()) return { error: 'Otázka nesmí být prázdná.' }

  const db = adminClient()

  const { data: last } = await db
    .from('tournament_questions')
    .select('col_index, sort_order')
    .order('col_index', { ascending: false })
    .limit(1)
    .single()

  const nextColIndex = (last?.col_index ?? 300) + 2
  const nextSortOrder = (last?.sort_order ?? 0) + 1

  const { error } = await db.from('tournament_questions').insert({
    col_index: nextColIndex,
    question: question.trim(),
    category,
    points_per_correct: points,
    sort_order: nextSortOrder,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return {}
}

export async function saveQuestionText(
  table: 'bonus_questions' | 'tournament_questions',
  questionId: string,
  question: string,
): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }
  if (!question.trim()) return { error: 'Otázka nesmí být prázdná.' }
  const { error } = await adminClient().from(table).update({ question: question.trim() }).eq('id', questionId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return {}
}

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
export async function saveBonusAnswer(questionId: string, correctAnswer: string, pointsPerCorrect?: number): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { error: `Chybí env: url=${!!url} key=${!!key}` }

  const db = adminClient()

  const updatePayload: Record<string, unknown> = { correct_answer: correctAnswer }
  if (pointsPerCorrect != null) updatePayload.points_per_correct = pointsPerCorrect

  const { error } = await db
    .from('bonus_questions')
    .update(updatePayload)
    .eq('id', questionId)

  if (error) return { error: `DB error: ${error.message} (code: ${error.code})` }

  // Přepočítej body přes SQL funkci (SECURITY DEFINER — obchází RLS)
  const { error: rpcError } = await db.rpc('recalculate_bonus_question', { p_question_id: questionId })
  if (rpcError) return { error: `Přepočet selhal: ${rpcError.message}` }

  revalidatePath('/leaderboard')
  return {}
}

// Uloží správnou odpověď na tournament_question a přepočítá body
export async function saveTournamentAnswer(questionId: string, correctAnswer: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return { error: 'Přístup odepřen.' }

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
