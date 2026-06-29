import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BonusAdmin from './BonusAdmin'

export default async function AdminBonusesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

  const [{ data: bonusQuestions }, { data: tournamentQuestions }] = await Promise.all([
    supabase.from('bonus_questions').select('*').order('sort_order'),
    supabase.from('tournament_questions').select('*').order('sort_order'),
  ])

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{
        background: 'rgba(10,15,30,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '14px 20px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/admin" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>← Admin</Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>Bonusové otázky</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: 24 }}>
          Po zadání správné odpovědi se automaticky přepočítají body všech tipujících a aktualizuje se žebříček.
        </p>
        <BonusAdmin
          bonusQuestions={bonusQuestions ?? []}
          tournamentQuestions={tournamentQuestions ?? []}
        />
      </div>
    </div>
  )
}
