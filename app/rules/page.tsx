import Link from 'next/link'

export default function RulesPage() {
  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45', padding: '12px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: 12 }}>Pravidla</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)' }}>Obsah bude doplněn.</p>
      </div>
    </div>
  )
}
