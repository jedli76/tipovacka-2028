'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  user_id: string
  display_name: string
  content: string
  created_at: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Prague',
  })
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Prague',
  })
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
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

export default function ChatWindow({
  initialMessages,
  currentUserId,
  currentDisplayName,
}: {
  initialMessages: Message[]
  currentUserId: string
  currentDisplayName: string
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')

    await supabase.from('messages').insert({
      user_id: currentUserId,
      display_name: currentDisplayName,
      content: text,
    })

    setSending(false)
    inputRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: 400 }}>
      {/* Zprávy */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: '0.9rem' }}>Zatím žádné zprávy. Buď první!</div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.user_id === currentUserId
          const showDay = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at)
          const prevSameSender = i > 0 && messages[i - 1].user_id === msg.user_id && !showDay
          const color = avatarColor(msg.display_name)

          return (
            <div key={msg.id}>
              {showDay && (
                <div style={{ textAlign: 'center', margin: '16px 0 8px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, padding: '3px 14px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                    {formatDay(msg.created_at)}
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 8,
                padding: `${prevSameSender ? 2 : 10}px 16px 0`,
              }}>
                {/* Avatar */}
                {!isMe && (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, color: '#fff',
                    flexShrink: 0,
                    opacity: prevSameSender ? 0 : 1,
                  }}>
                    {initials(msg.display_name)}
                  </div>
                )}

                <div style={{ maxWidth: '68%' }}>
                  {!prevSameSender && !isMe && (
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color, marginBottom: 3, paddingLeft: 2 }}>
                      {msg.display_name}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <div style={{
                      background: isMe ? '#4f46e5' : 'rgba(255,255,255,0.07)',
                      border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '8px 14px',
                      fontSize: '0.9rem',
                      color: '#e2e8f0',
                      lineHeight: 1.45,
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0, paddingBottom: 2 }}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: avatarColor(currentDisplayName),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {initials(currentDisplayName)}
        </div>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Napište zprávu… (Enter odešle)"
          maxLength={500}
          autoFocus
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '10px 14px',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            background: input.trim() ? '#4f46e5' : 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: 12,
            padding: '10px 16px',
            color: input.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          Odeslat
        </button>
      </div>
    </div>
  )
}
