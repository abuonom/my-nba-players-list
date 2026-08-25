'use client'

import { Player } from '@/types/nba'

const POTENTIAL_STYLE: Record<string, string> = {
  'A+': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  'A':  'bg-green-500/20 text-green-300 border-green-500/40',
  'B+': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'B':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'C+': 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  'C':  'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'D':  'bg-red-500/10 text-red-400 border-red-500/20',
}

function ovrClass(ovr: number) {
  if (ovr >= 95) return 'ovr-s'
  if (ovr >= 90) return 'ovr-a'
  if (ovr >= 85) return 'ovr-b'
  if (ovr >= 80) return 'ovr-c'
  return 'ovr-d'
}

interface Props {
  player: Player
  isSaved: boolean
  onSave: (player: Player) => void
  onRemove: (slug: string) => void
  potential?: string | null
  age?: number | null
}

export default function PlayerCard({ player, isSaved, onSave, onRemove, potential, age }: Props) {
  return (
    <div
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      className="border rounded-lg flex items-center gap-3 px-4 py-3 hover:border-[var(--border2)] hover:bg-[var(--surface2)] transition-colors cursor-pointer group"
    >
      {/* OVR */}
      <div
        className={`font-display text-4xl font-bold w-14 text-center leading-none shrink-0 ${ovrClass(player.overall)}`}
        onClick={() => window.open(`/player/${player.slug}`, '_blank')}
      >
        {player.overall}
      </div>

      {/* Name + team + positions */}
      <div
        className="flex-1 min-w-0"
        onClick={() => window.open(`/player/${player.slug}`, '_blank')}
      >
        <div className="font-display text-xl font-bold tracking-wide leading-tight truncate" style={{ color: 'var(--text)' }}>
          {player.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs truncate" style={{ color: 'var(--text-sec)' }}>{player.team}</span>
          {age != null && (
            <>
              <span style={{ color: 'var(--text-dim)' }}>·</span>
              <span className="text-xs shrink-0" style={{ color: 'var(--text-sec)' }}>{age} anni</span>
            </>
          )}
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <div className="flex gap-1">
            {player.positions.map(pos => (
              <span
                key={pos}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border)' }}
              >
                {pos}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className="hidden md:grid grid-cols-3 gap-x-5 gap-y-1 text-xs shrink-0"
        onClick={() => window.open(`/player/${player.slug}`, '_blank')}
      >
        {[
          ['3PT', player.attributes.threePointShot],
          ['SPD', player.attributes.speed],
          ['BLK', player.attributes.block],
          ['BH',  player.attributes.ballHandle],
          ['DEF', player.attributes.perimeterDefense],
          ['STL', player.attributes.steal],
        ].map(([label, val]) => (
          <span key={label as string} style={{ color: 'var(--text-sec)' }}>
            {label}{' '}
            <span style={{ color: 'var(--text)' }} className="font-semibold font-[tabular-nums]">
              {val ?? '—'}
            </span>
          </span>
        ))}
      </div>

      {/* Potential */}
      <div className="hidden sm:flex flex-col items-center w-10 shrink-0" onClick={() => window.open(`/player/${player.slug}`, '_blank')}>
        <span className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>POT</span>
        {potential === undefined ? (
          <div className="w-7 h-5 rounded animate-pulse" style={{ background: 'var(--border)' }} />
        ) : potential ? (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${POTENTIAL_STYLE[potential] ?? 'text-gray-400 border-gray-600'}`}>
            {potential}
          </span>
        ) : (
          <span style={{ color: 'var(--text-dim)' }} className="text-sm">—</span>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={() => isSaved ? onRemove(player.slug) : onSave(player)}
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
        style={isSaved
          ? { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
          : { background: 'rgba(232,160,32,0.1)', color: 'var(--gold)', border: '1px solid rgba(232,160,32,0.25)' }
        }
      >
        {isSaved ? 'Rimuovi' : 'Salva'}
      </button>
    </div>
  )
}
