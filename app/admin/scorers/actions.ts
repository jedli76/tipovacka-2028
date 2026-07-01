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

export async function updateScorerGoals(scorerName: string, goals: number): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }

  const db = adminClient()

  const { error } = await db
    .from('scorers')
    .update({ goals, updated_at: new Date().toISOString() })
    .eq('name', scorerName)

  if (error) return { error: `DB error: ${error.message}` }

  // Recalculate scorer points for all users
  const { error: rpcError } = await db.rpc('recalculate_scorer_points')
  if (rpcError) return { error: `Přepočet selhal: ${rpcError.message}` }

  revalidatePath('/leaderboard')
  revalidatePath('/admin/scorers')
  return {}
}
