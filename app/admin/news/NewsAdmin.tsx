'use client'

import { useState, useTransition, useRef } from 'react'
import { saveNewsPost, deleteNewsPost } from './actions'
import { createClient } from '@/lib/supabase/client'

type NewsPost = {
  id: string
  title: string
  content: string
  cover_image_url: string | null
  published: boolean
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box' as const,
}

function Editor({ post, onDone }: { post?: NewsPost; onDone: () => void }) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [published, setPublished] = useState(post?.published ?? true)
  const [err, setErr] = useState('')
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('news-images').upload(path, file, { upsert: true })
      if (error) { setErr(error.message); return }
      const { data } = supabase.storage.from('news-images').getPublicUrl(path)
      setCoverImageUrl(data.publicUrl)
    } finally {
      setUploading(false)
    }
  }

  function submit() {
    setErr('')
    startTransition(async () => {
      const fd = new FormData()
      if (post?.id) fd.append('id', post.id)
      fd.append('title', title)
      fd.append('content', content)
      fd.append('cover_image_url', coverImageUrl)
      fd.append('published', String(published))
      const res = await saveNewsPost(fd)
      if (res.error) setErr(res.error)
      else onDone()
    })
  }

  return (
    <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: 20 }}>
      <div style={{ fontWeight: 800, color: '#a5b4fc', marginBottom: 16, fontSize: '0.95rem' }}>
        {post ? 'Upravit příspěvek' : 'Nový příspěvek'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nadpis</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nadpis příspěvku..." style={inputStyle} autoFocus />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Náhledový obrázek
          </label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 16px', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: uploading ? 0.6 : 1 }}
            >
              {uploading ? 'Nahrávám...' : '📁 Vybrat obrázek'}
            </button>
            {coverImageUrl && (
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Odebrat
              </button>
            )}
          </div>
          {coverImageUrl && (
            <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
              <img src={coverImageUrl} alt="náhled" style={{ width: 180, height: 120, objectFit: 'cover', display: 'block', borderRadius: 8 }} />
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Obsah (Markdown)
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
            placeholder={`**Tučný text**, *kurzíva*, [odkaz](https://url.cz)\n\nOdkaz na tweet (samostatně na řádku):\nhttps://x.com/uzivatel/status/123456789`}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }}
          />
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
            Markdown: **tučně**, *kurzíva*, [text](url), ![alt](url-obrázku), ## Nadpis · Tweet: vlož URL na samostatný řádek
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
          <span style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>Publikovat (zobrazit na dashboardu)</span>
        </label>
      </div>
      {err && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 10 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={submit} disabled={pending || !title.trim()} style={{ background: '#4f46e5', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', opacity: pending ? 0.6 : 1 }}>
          {pending ? 'Ukládám...' : 'Uložit'}
        </button>
        <button onClick={onDone} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem' }}>
          Zrušit
        </button>
      </div>
    </div>
  )
}

export default function NewsAdmin({ posts, forceAddOpen, onAddClose }: { posts: NewsPost[]; forceAddOpen?: boolean; onAddClose?: () => void }) {
  const [editing, setEditing] = useState<NewsPost | null>(null)
  const [deletePending, startDelete] = useTransition()

  const isAdding = forceAddOpen && !editing

  function close() {
    setEditing(null)
    onAddClose?.()
  }

  if (isAdding || editing) {
    return <Editor post={editing ?? undefined} onDone={close} />
  }

  return (
    <div>
      {posts.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', marginBottom: 16 }}>Zatím žádné příspěvky.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {posts.map(post => (
          <div key={post.id} style={{
            background: post.published ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${post.published ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 12, padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, minWidth: 0, flex: 1 }}>
                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0' }}>{post.title}</span>
                    {!post.published && <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>SKRYTÝ</span>}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>{formatDate(post.created_at)}</p>
                  {post.content && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{post.content.replace(/[#*`[\]!]/g, '').slice(0, 100)}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => setEditing(post)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Upravit
                </button>
                <button
                  onClick={() => { if (confirm('Smazat příspěvek?')) startDelete(async () => { await deleteNewsPost(post.id) }) }}
                  disabled={deletePending}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 12px', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
