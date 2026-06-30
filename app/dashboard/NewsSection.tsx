'use client'

import ReactMarkdown from 'react-markdown'

type NewsPost = {
  id: string
  title: string
  content: string
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NewsSection({ posts }: { posts: NewsPost[] }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, padding: '16px 20px' }}>
      <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: posts.length === 0 ? 12 : 16 }}>📰 Novinky</h2>
      {posts.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
          Zatím žádné novinky.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {posts.map((post, i) => (
            <div key={post.id}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />}
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: 6, fontWeight: 600 }}>
                {formatDate(post.created_at)}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 10 }}>{post.title}</h3>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#cbd5e1' }} className="news-content">
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>{children}</a>
                    ),
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: 10, marginTop: 8, marginBottom: 8 }} />
                    ),
                    strong: ({ children }) => <strong style={{ color: '#fff', fontWeight: 700 }}>{children}</strong>,
                    h2: ({ children }) => <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginTop: 14, marginBottom: 6 }}>{children}</div>,
                    h3: ({ children }) => <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', marginTop: 10, marginBottom: 4 }}>{children}</div>,
                    ul: ({ children }) => <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 6 }}>{children}</ul>,
                    li: ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
                    p: ({ children }) => <p style={{ marginBottom: 8 }}>{children}</p>,
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
