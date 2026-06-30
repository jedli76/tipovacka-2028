'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function adminDb() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function checkAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user && user.email === 'romanjedlicka@gmail.com'
}

export async function saveNewsPost(formData: FormData): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }
  const id = formData.get('id') as string | null
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const published = formData.get('published') === 'true'
  if (!title) return { error: 'Název nesmí být prázdný.' }
  const db = adminDb()
  if (id) {
    const { error } = await db.from('news').update({ title, content, published }).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await db.from('news').insert({ title, content, published })
    if (error) return { error: error.message }
  }
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteNewsPost(id: string): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }
  const { error } = await adminDb().from('news').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return {}
}
