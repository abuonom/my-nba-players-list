'use client'

import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: number
  text: string
  sub?: string
  color: string
  bg: string
  border: string
}

interface Props {
  messages: ToastMessage[]
  onDismiss: (id: number) => void
}

export default function Toast({ messages, onDismiss }: Props) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {messages.map(msg => (
        <ToastItem key={msg.id} msg={msg} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ msg, onDismiss }: { msg: ToastMessage; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(msg.id), 300)
    }, 4000)
    return () => clearTimeout(t)
  }, [msg.id, onDismiss])

  return (
    <div
      className="pointer-events-auto px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300"
      style={{
        background: msg.bg,
        border: `1px solid ${msg.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        minWidth: '220px',
        maxWidth: '320px',
      }}
      onClick={() => onDismiss(msg.id)}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: msg.color, boxShadow: `0 0 6px ${msg.color}` }}
      />
      <div className="min-w-0">
        <div className="text-sm font-display font-bold leading-tight" style={{ color: msg.color }}>
          {msg.text}
        </div>
        {msg.sub && (
          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-sec)' }}>{msg.sub}</div>
        )}
      </div>
    </div>
  )
}
