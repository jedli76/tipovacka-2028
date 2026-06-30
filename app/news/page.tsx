import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NewsSection from '@/app/dashboard/NewsSection'

export default async function NewsArchivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: posts } = await supabase
    .from('news')
    .select('id, title, content, cover_image_url, cover_image_position, created_at')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e2e8f0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>📰 Archiv novinek</span>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px' }}>
        <NewsSection posts={posts ?? []} archiveMode />
      </main>
    </div>
  )
}
