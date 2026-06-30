import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

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
        {!posts || posts.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Zatím žádné novinky.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {posts.map(post => (
              <div key={post.id} style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    {post.cover_image_url && (
                      <img
                        src={post.cover_image_url}
                        alt=""
                        style={{ width: 96, height: 72, objectFit: 'cover', objectPosition: post.cover_image_position ?? '50% 50%', borderRadius: 10, flexShrink: 0 }}
                      />
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                        {post.title}
                        <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>
                          ({formatDate(post.created_at)})
                        </span>
                      </h2>
                      <div style={{ fontSize: '0.87rem', lineHeight: 1.65, color: '#cbd5e1' }}>
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>{children}</a>,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            img: (props: any) => <img src={props.src} alt={props.alt} style={{ maxWidth: '100%', borderRadius: 10, marginTop: 8 }} />,
                            strong: ({ children }) => <strong style={{ color: '#fff' }}>{children}</strong>,
                            p: ({ children }) => <p style={{ marginBottom: 8 }}>{children}</p>,
                            ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 8 }}>{children}</ul>,
                          }}
                        >
                          {post.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
