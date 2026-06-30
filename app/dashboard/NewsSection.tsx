'use client'

import ReactMarkdown from 'react-markdown'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type NewsPost = {
  id: string
  title: string
  content: string
  cover_image_url: string | null
  cover_image_position: string | null
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

const mdComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>{children}</a>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  img: (props: any) => (
    <img src={props.src as string} alt={props.alt} style={{ maxWidth: '100%', borderRadius: 10, marginTop: 8, marginBottom: 8 }} />
  ),
  strong: ({ children }: { children?: React.ReactNode }) => <strong style={{ color: '#fff', fontWeight: 700 }}>{children}</strong>,
  h2: ({ children }: { children?: React.ReactNode }) => <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginTop: 14, marginBottom: 6 }}>{children}</div>,
  h3: ({ children }: { children?: React.ReactNode }) => <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', marginTop: 10, marginBottom: 4 }}>{children}</div>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 6 }}>{children}</ul>,
  li: ({ children }: { children?: React.ReactNode }) => <li style={{ marginBottom: 3 }}>{children}</li>,
  p: ({ children }: { children?: React.ReactNode }) => {
    const tweetUrl = isStandaloneTweetUrl(children)
    if (tweetUrl) return <TweetEmbed url={tweetUrl} />
    return <p style={{ marginBottom: 8 }}>{children}</p>
  },
}

function NewsCard({ post, divider }: { post: NewsPost; divider: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = post.content.trim().split(/\n\n+/)
  const firstParagraph = paragraphs[0]
  const CHAR_LIMIT = 200
  const preview = firstParagraph.length > CHAR_LIMIT
    ? firstParagraph.slice(0, CHAR_LIMIT).trimEnd() + '…'
    : firstParagraph
  const isLong = paragraphs.length > 1 || post.content.trim().length > CHAR_LIMIT

  return (
    <div>
      {divider && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
      <div style={{ padding: '16px 20px' }}>
        {/* Hlavička: obrázek + nadpis + datum */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt=""
              style={{ width: 96, height: 72, objectFit: 'cover', objectPosition: post.cover_image_position ?? '50% 50%', borderRadius: 10, flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>
              {post.title}
              <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: 8, whiteSpace: 'nowrap' }}>
                ({formatDate(post.created_at)})
              </span>
            </h3>
            {expanded ? (
              <div style={{ fontSize: '0.87rem', lineHeight: 1.65, color: '#cbd5e1' }}>
                <ReactMarkdown components={mdComponents}>{post.content}</ReactMarkdown>
                {isLong && (
                  <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                    méně ▲
                  </button>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.87rem', lineHeight: 1.65, color: '#cbd5e1', margin: 0 }}>
                {preview}
                {isLong && (
                  <button onClick={() => setExpanded(true)} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: '0 0 0 6px', verticalAlign: 'baseline' }}>
                    více ▼
                  </button>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsSection({ posts, archiveMode }: { posts: NewsPost[]; archiveMode?: boolean }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px 10px' }}>
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
            <NewsCard key={post.id} post={post} divider={i > 0} />
          ))}
          {!archiveMode && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 20px' }}>
              <Link href="/news" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textDecoration: 'none', letterSpacing: '0.04em' }}>
                📂 Archiv novinek →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
