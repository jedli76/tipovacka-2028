'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveBio(bio: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nejste přihlášen.' }

  const { error } = await supabase
    .from('profiles')
    .update({ bio: bio.trim().slice(0, 300) || null })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profil')
  return {}
}
