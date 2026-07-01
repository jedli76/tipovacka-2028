import { isAdmin } from '@/lib/admins'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ScorersAdmin from './ScorersAdmin'

export default async function ScorersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) redirect('/dashboard')

  const [{ data: scorers }, { data: tips }] = await Promise.all([
    supabase.from('scorers').select('name, goals').order('name'),
    supabase.from('scorer_tips').select('scorer_name'),
  ])

  const tipCountByScorer: Record<string, number> = {}
  for (const t of tips ?? []) {
    tipCountByScorer[t.scorer_name] = (tipCountByScorer[t.scorer_name] ?? 0) + 1
  }

  const maxGoals = Math.max(0, ...(scorers ?? []).map(s => s.goals))
  const scorerList = (scorers ?? []).map(s => ({
    name: s.name,
    goals: s.goals,
    tip_count: tipCountByScorer[s.name] ?? 0,
    is_top: s.goals > 0 && s.goals === maxGoals,
  })).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals
    return b.tip_count - a.tip_count
  })

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: '#fff' }}>⚽ Střelci — Admin</span>
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>← Zpět na admin</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#fff', marginBottom: 6 }}>⚽ Správa střelců</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Každý tipující si vybral 3 střelce. Za každý gól střelce dostane tipující 10 bodů.
          </p>
        </div>
        <ScorersAdmin scorers={scorerList} />
      </div>
    </div>
  )
}
