'use client'

import { Player } from '@/types/nba'
import type { ContractEntry } from '@/app/api/contracts/route'

function formatSalary(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return `$${(n / 1_000).toFixed(0)}K`
}

const NOTE_SHORT: Record<string, string> = { PO: 'PO', TO: 'TO', QO: 'QO' }
const NOTE_TITLE: Record<string, string> = { PO: 'Player Option', TO: 'Team Option', QO: 'Qualifying Offer' }

const POTENTIAL_STYLE: Record<string, string> = {
  'A+': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  'A':  'bg-green-500/20 text-green-300 border-green-500/40',
  'A-': 'bg-green-500/10 text-green-400 border-green-500/25',
  'B+': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'B':  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'B-': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
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
  contract?: ContractEntry | null
}

export default function PlayerCard({ player, isSaved, onSave, onRemove, potential, age, contract }: Props) {
  const firstSalary = contract?.salaries[0]
  const note = firstSalary?.note

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer group hover:border-[var(--border2)]"
      style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}
    >
      {/* OVR */}
      <div
        className={`font-display text-4xl font-black w-14 text-center leading-none shrink-0 ${ovrClass(player.overall)}`}
        onClick={() => window.open(`/player/${player.slug}`, '_blank')}
      >
        {player.overall}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0" onClick={() => window.open(`/player/${player.slug}`, '_blank')}>
        <div className="font-display text-xl font-bold leading-tight truncate" style={{ color: 'var(--text)' }}>
          {player.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: 'var(--text-sec)' }}>{player.team}</span>
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
                style={{ background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border2)' }}
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
            <span className="font-semibold tabular-nums" style={{ color: 'var(--text)' }}>
              {val ?? '—'}
            </span>
          </span>
        ))}
      </div>

      {/* Potential */}
      <div className="hidden sm:flex flex-col items-center w-10 shrink-0" onClick={() => window.open(`/player/${player.slug}`, '_blank')}>
        <span className="text-[9px] uppercase tracking-widest mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>POT</span>
        {potential === undefined ? (
          <div className="w-7 h-5 rounded animate-pulse" style={{ background: 'var(--border)' }} />
        ) : potential ? (
          <span className={`font-display text-sm font-black px-1.5 py-0.5 rounded border ${POTENTIAL_STYLE[potential] ?? 'text-gray-400 border-gray-600'}`}>
            {potential}
          </span>
        ) : (
          <span style={{ color: 'var(--text-dim)' }}>—</span>
        )}
      </div>

      {/* Contract + Save — grouped right, no extra gap */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:block" onClick={() => window.open(`/player/${player.slug}`, '_blank')}>
          {contract === undefined ? (
            <div className="w-36 h-9 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
          ) : contract && firstSalary ? (
            <div className="flex divide-x rounded-lg overflow-hidden" style={{ border: '1px solid var(--border2)' }}>
              <div className="px-2.5 py-1.5 text-center" style={{ background: 'var(--surface2)' }}>
                <div className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-sec)' }}>Durata</div>
                <div className="font-display text-sm font-bold leading-none whitespace-nowrap" style={{ color: 'var(--text)' }}>
                  {contract.years_remaining}<span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--text-sec)' }}>yr</span>
                </div>
              </div>
              <div className="px-2.5 py-1.5 text-center" style={{ background: 'var(--surface2)' }}>
                <div className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-sec)' }}>Valore</div>
                <div className="font-display text-sm font-bold leading-none tabular-nums whitespace-nowrap" style={{ color: 'var(--gold)' }}>
                  {formatSalary(firstSalary.amount)}<span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--text-sec)' }}>/yr</span>
                </div>
              </div>
              <div className="px-2.5 py-1.5 text-center" style={{ background: 'var(--surface2)' }}>
                <div className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-sec)' }}>Opzione</div>
                {note && NOTE_SHORT[note] ? (
                  <span
                    className="font-display text-sm font-black px-1.5 rounded"
                    style={{ background: 'var(--gold-bg2)', color: 'var(--gold)', border: '1px solid var(--gold-dim)' }}
                    title={NOTE_TITLE[note]}
                  >
                    {NOTE_SHORT[note]}
                  </span>
                ) : (
                  <div className="text-sm font-bold" style={{ color: 'var(--text-sec)' }}>—</div>
                )}
              </div>
            </div>
          ) : contract === null ? (
            <div
              className="px-3 py-1.5 rounded-lg text-center"
              style={{ border: '1px solid var(--border2)', background: 'var(--surface2)' }}
            >
              <span className="font-display text-sm font-black tracking-widest" style={{ color: 'var(--text-sec)' }}>FA</span>
              <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-dim)' }}>Free Agent</div>
            </div>
          ) : null}
        </div>

        <button
          onClick={() => isSaved ? onRemove(player.slug) : onSave(player)}
          className="text-xs font-semibold px-3 py-2 rounded-lg transition-all whitespace-nowrap"
          style={isSaved
            ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
            : { background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-dim)' }
          }
        >
          {isSaved ? 'Rimuovi' : 'Salva'}
        </button>
      </div>
    </div>
  )
}
