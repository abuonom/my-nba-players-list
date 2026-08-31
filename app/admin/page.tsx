'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '0a4acf29-3841-43ce-bfcf-e4047d1f8c59'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.id !== ADMIN_USER_ID) {
        router.replace('/')
        return
      }
      fetchUsers()
    })
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const json = await res.json()
    if (json.error) { setError(json.error); setLoading(false); return }
    setUsers(json.users.sort((a: User, b: User) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ))
    setLoading(false)
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Eliminare l'account di ${email}?`)) return
    setDeleting(userId)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const json = await res.json()
    if (json.error) { alert(json.error); setDeleting(null); return }
    setUsers(prev => prev.filter(u => u.id !== userId))
    setDeleting(null)
  }

  function fmt(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-xs font-semibold px-3 py-1.5 rounded"
              style={{ background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border)' }}
            >
              ← Torna
            </button>
            <span className="font-display text-lg font-black tracking-wider" style={{ color: 'var(--gold)' }}>
              ADMIN
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {users.length} account
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {users.map((user, i) => {
              const isAdmin = user.id === ADMIN_USER_ID
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{
                    background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)',
                    borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {user.email}
                      </span>
                      {isAdmin && (
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded font-display tracking-wider shrink-0"
                          style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-dim)' }}
                        >
                          ADMIN
                        </span>
                      )}
                      {!user.email_confirmed_at && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}
                        >
                          non confermato
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                        Registrato {fmt(user.created_at)}
                      </span>
                      {user.last_sign_in_at && (
                        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                          · Ultimo accesso {fmt(user.last_sign_in_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAdmin && (
                    <button
                      onClick={() => deleteUser(user.id, user.email ?? '')}
                      disabled={deleting === user.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-opacity"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.25)',
                        opacity: deleting === user.id ? 0.5 : 1,
                      }}
                    >
                      {deleting === user.id ? '...' : 'Elimina'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
