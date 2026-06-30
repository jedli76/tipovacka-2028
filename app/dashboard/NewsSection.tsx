'use client'

import ReactMarkdown from 'react-markdown'
import { useEffect, useRef } from 'react'

type NewsPost = {
  id: string
  title: string
  content: string
  cover_image_url: string | null
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

const TWEET_RE = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/(\d+)/

function TweetEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const match = url.match(TWEET_RE)
  const tweetId = match?.[3]

  useEffect(() => {
    if (!tweetId || !ref.current) return
    ref.current.innerHTML = `<blockquote class="twitter-tweet" data-theme="dark"><a href="${url}"></a></blockquote>`
    const existing = document.getElementById('twitter-widget-js')
    if (existing) {
      // @ts-ignore
      if (window.twttr?.widgets) window.twttr.widgets.load(ref.current)
    } else {
      const s = document.createElement('script')
      s.id = 'twitter-widget-js'
      s.src = 'https://platform.twitter.com/widgets.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [tweetId, url])

  if (!tweetId) return <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', wordBreak: 'break-all' }}>{url}</a>
  return <div ref={ref} style={{ margin: '8px 0' }} />
}

function isStandaloneTweetUrl(children: React.ReactNode): string | null {
  if (typeof children === 'string' && TWEET_RE.test(children.trim())) return children.trim()
  if (Array.isArray(children) && children.length === 1 && typeof children[0] === 'string' && TWEET_RE.test(children[0].trim())) return children[0].trim()
  return null
}

export default function NewsSection({ posts }: { posts: NewsPost[] }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 12px' }}>
        <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>📰 Novinky</h2>
      </div>
      {posts.length === 0 ? (
        <div style={{ padding: '0 20px 16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
            Zatím žádné novinky.
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post, i) => (
            <div key={post.id}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
              {post.cover_image_url && (
                <div style={{ width: '100%', maxHeight: 220, overflow: 'hidden' }}>
                  <img
                    src={post.cover_image_url}
                    alt=""
                    style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
              <div style={{ padding: '14px 20px 16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: 5, fontWeight: 600 }}>
                  {formatDate(post.created_at)}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 10 }}>{post.title}</h3>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#cbd5e1' }}>
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
                      p: ({ children }) => {
                        const tweetUrl = isStandaloneTweetUrl(children)
                        if (tweetUrl) return <TweetEmbed url={tweetUrl} />
                        return <p style={{ marginBottom: 8 }}>{children}</p>
                      },
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
