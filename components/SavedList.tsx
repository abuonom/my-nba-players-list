'use client'

import { useState } from 'react'
import { Player } from '@/types/nba'
import type { ContractEntry } from '@/app/api/contracts/route'
import CapPanel from './CapPanel'
import { matchContract } from '@/lib/nba/matchContract'

interface Props {
  players: Player[]
  contracts: ContractEntry[]
  onRemove: (slug: string) => void
  onClearAll: () => void
  onClose: () => void
}

function ovrClass(ovr: number) {
  if (ovr >= 95) return 'ovr-s'
  if (ovr >= 90) return 'ovr-a'
  if (ovr >= 85) return 'ovr-b'
  if (ovr >= 80) return 'ovr-c'
  return 'ovr-d'
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return `$${(n / 1_000).toFixed(0)}K`
}

export default function SavedList({ players, contracts, onRemove, onClearAll, onClose }: Props) {
  const [confirmClear, setConfirmClear] = useState(false)
  const playerContracts = players.map(p => matchContract(p.name, contracts))
  const teamSalaries = playerContracts
    .map(c => c?.salaries[0]?.amount ?? 0)

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="relative w-full max-w-sm flex flex-col h-full"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide" style={{ color: 'var(--gold)' }}>
              La mia Rosa
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-sec)' }}>
              {players.length} giocatori
            </p>
          </div>
          <div className="flex items-center gap-2">
            {players.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded transition-colors"
                style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Svuota
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded transition-colors text-lg"
              style={{ color: 'var(--text-sec)', background: 'var(--surface2)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--text-sec)' }}>
            <span className="text-4xl">🏀</span>
            <p className="text-sm">Nessun giocatore nella rosa</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {/* Salary cap monitor */}
            <CapPanel teamSalaries={teamSalaries} />

            {/* Roster */}
            <div className="space-y-1">
              {players.map((player, i) => {
                const contract = playerContracts[i]
                const salary = contract?.salaries[0]?.amount
                return (
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
                    <div className="text-right shrink-0">
                      {salary ? (
                        <div className="font-display text-sm font-bold tabular-nums" style={{ color: 'var(--gold)' }}>
                          {fmt(salary)}
                        </div>
                      ) : (
                        <div className="text-xs font-bold" style={{ color: 'var(--text-dim)' }}>FA</div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(player.slug)}
                      className="text-xs font-semibold px-2 py-1 rounded transition-colors shrink-0"
                      style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirm clear dialog */}
      {confirmClear && (
        <div
          className="absolute inset-0 z-10 flex items-end pb-8 justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setConfirmClear(false)}
        >
          <div
            className="w-[calc(100%-32px)] rounded-2xl p-5 space-y-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="font-display text-base font-black tracking-wide" style={{ color: 'var(--text)' }}>
                Svuotare la rosa?
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-sec)' }}>
                Tutti i {players.length} giocatori verranno rimossi.
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 text-sm font-semibold py-2 rounded-xl transition-colors"
                style={{ background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border)' }}
              >
                Annulla
              </button>
              <button
                onClick={() => { onClearAll(); setConfirmClear(false) }}
                className="flex-1 text-sm font-semibold py-2 rounded-xl transition-colors"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                Svuota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
