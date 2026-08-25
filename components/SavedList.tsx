'use client'

import { Player } from '@/types/nba'

interface Props {
  players: Player[]
  onRemove: (slug: string) => void
  onClose: () => void
}

function ovrClass(ovr: number) {
  if (ovr >= 95) return 'ovr-s'
  if (ovr >= 90) return 'ovr-a'
  if (ovr >= 85) return 'ovr-b'
  if (ovr >= 80) return 'ovr-c'
  return 'ovr-d'
}

export default function SavedList({ players, onRemove, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-sm flex flex-col h-full"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide" style={{ color: 'var(--text)' }}>
              La mia lista
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-sec)' }}>
              {players.length} giocatori salvati
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors text-lg"
            style={{ color: 'var(--text-sec)', background: 'var(--surface2)' }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        {players.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--text-sec)' }}>
            <span className="text-4xl">🏀</span>
            <p className="text-sm">Nessun giocatore salvato</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
            {players.map((player, i) => (
              <div
                key={player.slug}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
              >
                <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--text-dim)' }}>
                  {i + 1}
                </span>
                <div className={`font-display text-2xl font-bold w-10 text-center leading-none ${ovrClass(player.overall)}`}>
                  {player.overall}
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => window.open(`/player/${player.slug}`, '_blank')}
                >
                  <div className="font-display font-bold text-base leading-tight truncate" style={{ color: 'var(--text)' }}>
                    {player.name}
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-sec)' }}>
                    {player.team} · {player.positions.join('/')}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(player.slug)}
                  className="text-xs font-semibold px-2 py-1 rounded transition-colors shrink-0"
                  style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
