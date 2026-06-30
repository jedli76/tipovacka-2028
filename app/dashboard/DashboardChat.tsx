'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Message = {
  id: string
  user_id: string
  display_name: string
  content: string
  created_at: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6']
function avatarColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(h) % COLORS.length]
}

export default function DashboardChat({ currentUserId, currentDisplayName }: { currentUserId: string; currentDisplayName: string }) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(60)
      .then(({ data }) => { if (data) setMessages(data) })

    const channel = supabase.channel('dash-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => setMessages(prev => [...prev, payload.new as Message])
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    await supabase.from('messages').insert({ user_id: currentUserId, display_name: currentDisplayName, content: text })
    setSending(false)
    inputRef.current?.focus()
  }

  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* Hlavička */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>💬 Chat</h2>
        <Link href="/chat" style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>plný chat →</Link>
      </div>

      {/* Zprávy */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', minHeight: 0 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
            Zatím žádné zprávy.
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.user_id === currentUserId
          const prevSameSender = i > 0 && messages[i - 1].user_id === msg.user_id
          const color = avatarColor(msg.display_name)
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6, padding: `${prevSameSender ? 2 : 8}px 12px 0` }}>
              {!isMe && (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 800, color: '#fff', flexShrink: 0, opacity: prevSameSender ? 0 : 1 }}>
                  {initials(msg.display_name)}
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {!prevSameSender && !isMe && (
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color, marginBottom: 2, paddingLeft: 2 }}>{msg.display_name}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                  <div style={{ background: isMe ? '#4f46e5' : 'rgba(255,255,255,0.07)', border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '6px 11px', fontSize: '0.83rem', color: '#e2e8f0', lineHeight: 1.4, wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0, paddingBottom: 1 }}>{formatTime(msg.created_at)}</div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Napište zprávu…"
          maxLength={500}
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#e2e8f0', fontSize: '0.83rem', outline: 'none', minWidth: 0 }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{ background: input.trim() ? '#4f46e5' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '8px 14px', color: input.trim() ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '0.8rem', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0 }}
        >
          →
        </button>
      </div>
    </div>
  )
}
