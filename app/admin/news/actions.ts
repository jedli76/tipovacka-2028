'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admins'

function adminDb() {
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

export async function saveNewsPost(formData: FormData): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }
  const id = formData.get('id') as string | null
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const cover_image_url = (formData.get('cover_image_url') as string)?.trim() || null
  const cover_image_position = (formData.get('cover_image_position') as string)?.trim() || '50% 50%'
  const published = formData.get('published') === 'true'
  if (!title) return { error: 'Název nesmí být prázdný.' }
  const db = adminDb()
  if (id) {
    const { error } = await db.from('news').update({ title, content, cover_image_url, cover_image_position, published }).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await db.from('news').insert({ title, content, cover_image_url, cover_image_position, published })
    if (error) return { error: error.message }
  }
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return {}
}

export async function reorderNewsPost(id: string, direction: 'up' | 'down'): Promise<{ error?: string }> {
  if (!await checkAdmin()) return { error: 'Přístup odepřen.' }
  const db = adminDb()
  const { data: posts, error } = await db.from('news').select('id, sort_order').order('sort_order', { ascending: true })
  if (error || !posts) return { error: error?.message ?? 'Chyba načítání.' }
  const idx = posts.findIndex(p => p.id === id)
  if (idx < 0) return { error: 'Příspěvek nenalezen.' }
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= posts.length) return {}
  const a = posts[idx], b = posts[swapIdx]
  await Promise.all([
    db.from('news').update({ sort_order: b.sort_order }).eq('id', a.id),
    db.from('news').update({ sort_order: a.sort_order }).eq('id', b.id),
  ])
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
