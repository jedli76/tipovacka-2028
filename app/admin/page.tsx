import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminTabs from './AdminTabs'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

  const [
    { data: matches },
    { data: bonusQuestions },
    { data: tournamentQuestions },
    { data: newsPosts },
  ] = await Promise.all([
    supabase.from('matches').select('*').order('kickoff_at', { ascending: true }),
    supabase.from('bonus_questions').select('*').order('sort_order'),
    supabase.from('tournament_questions').select('*').order('sort_order'),
    supabase.from('news').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: '#fff' }}>⚙️ Admin — Tipovačka MS 2026</span>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        <AdminTabs
          matches={matches ?? []}
          bonusQuestions={bonusQuestions ?? []}
          tournamentQuestions={tournamentQuestions ?? []}
          newsPosts={newsPosts ?? []}
        />
      </div>
    </div>
  )
}
