import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BioForm from './BioForm'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: scorerTips }] = await Promise.all([
    supabase.from('profiles').select('display_name, bio').eq('id', user.id).single(),
    supabase.from('scorer_tips').select('scorer_name').eq('user_id', user.id),
  ])

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e2e8f0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>👤 Můj profil</span>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '24px' }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
              Přezdívka
            </p>
            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{profile?.display_name}</p>
          </div>

          <BioForm currentBio={profile?.bio ?? null} />
        </div>

        {scorerTips && scorerTips.length > 0 && (
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '24px', marginTop: 16 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              ⚽ Moji tipovaní střelci
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scorerTips.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', width: 16 }}>{i + 1}.</span>
                  <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>{t.scorer_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Charakteristika se zobrazí ostatním hráčům na tvé stránce s tipy.
        </p>
      </main>
    </div>
  )
}
