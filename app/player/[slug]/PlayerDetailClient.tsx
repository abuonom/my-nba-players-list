'use client'

import { useEffect, useState } from 'react'
import { Player } from '@/types/nba'
import { useSavedPlayers } from '@/hooks/useSavedPlayers'
import { ContractEntry } from '@/app/api/contracts/route'

interface Props { player: Player }

const ATTR_SECTIONS = [
  { title: 'Tiro', attrs: [
    { key: 'closeShot', label: 'Close Shot' }, { key: 'midRangeShot', label: 'Mid Range' },
    { key: 'threePointShot', label: '3 Punti' }, { key: 'freeThrow', label: 'Tiro Libero' },
    { key: 'shotIQ', label: 'Shot IQ' }, { key: 'offensiveConsistency', label: 'Consistenza Off.' },
  ]},
  { title: 'Finishing', attrs: [
    { key: 'drivingLayup', label: 'Layup' }, { key: 'standingDunk', label: 'Standing Dunk' },
    { key: 'drivingDunk', label: 'Driving Dunk' }, { key: 'postHook', label: 'Post Hook' },
    { key: 'postFade', label: 'Post Fade' }, { key: 'postControl', label: 'Post Control' },
    { key: 'drawFoul', label: 'Draw Foul' }, { key: 'hands', label: 'Mani' },
  ]},
  { title: 'Playmaking', attrs: [
    { key: 'speedWithBall', label: 'Vel. con Palla' }, { key: 'ballHandle', label: 'Ball Handle' },
    { key: 'passAccuracy', label: 'Passaggio' }, { key: 'passVision', label: 'Visione' },
    { key: 'passIQ', label: 'Pass IQ' }, { key: 'passPerception', label: 'Percezione' },
  ]},
  { title: 'Difesa', attrs: [
    { key: 'interiorDefense', label: 'Difesa Interna' }, { key: 'perimeterDefense', label: 'Difesa Per.' },
    { key: 'steal', label: 'Intercetto' }, { key: 'block', label: 'Stoppata' },
    { key: 'lateralQuickness', label: 'Lat. Quickness' }, { key: 'helpDefenseIQ', label: 'Help Def IQ' },
    { key: 'defensiveConsistency', label: 'Consistenza Dif.' }, { key: 'defensiveRebound', label: 'Rimbalzo Dif.' },
  ]},
  { title: 'Atletismo', attrs: [
    { key: 'speed', label: 'Velocità' }, { key: 'agility', label: 'Agilità' },
    { key: 'strength', label: 'Forza' }, { key: 'vertical', label: 'Verticale' },
    { key: 'stamina', label: 'Resistenza' }, { key: 'hustle', label: 'Grinta' },
    { key: 'durability', label: 'Durabilità' }, { key: 'offensiveRebound', label: 'Rimbalzo Off.' },
  ]},
]

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string; shadow?: string }> = {
  'Legend':       { bg: 'rgba(239,68,68,0.2)',   color: '#fca5a5', border: 'rgba(239,68,68,0.5)',   shadow: '0 0 8px rgba(239,68,68,0.4)' },
  'Hall of Fame': { bg: 'rgba(168,85,247,0.2)',  color: '#d8b4fe', border: 'rgba(168,85,247,0.5)',  shadow: '0 0 8px rgba(168,85,247,0.3)' },
  'Gold':         { bg: 'rgba(234,179,8,0.2)',   color: '#fde047', border: 'rgba(234,179,8,0.5)' },
  'Silver':       { bg: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: 'rgba(148,163,184,0.4)' },
  'Bronze':       { bg: 'rgba(180,83,9,0.2)',    color: '#fdba74', border: 'rgba(180,83,9,0.5)' },
}

const TIER_ORDER = ['Legend', 'Hall of Fame', 'Gold', 'Silver', 'Bronze']

const POTENTIAL_STYLE: Record<string, string> = {
  'A+': 'text-yellow-300', 'A': 'text-green-400',
  'B+': 'text-blue-400',   'B': 'text-blue-300',
  'C+': 'text-slate-300',  'C': 'text-slate-400', 'D': 'text-red-400',
}

function ovrColor(ovr: number) {
  if (ovr >= 95) return 'var(--ovr-s)'
  if (ovr >= 90) return 'var(--ovr-a)'
  if (ovr >= 85) return 'var(--ovr-b)'
  if (ovr >= 80) return 'var(--ovr-c)'
  return 'var(--ovr-d)'
}

function barColor(val: number) {
  if (val >= 90) return '#22c55e'
  if (val >= 75) return '#3b82f6'
  if (val >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function PlayerDetailClient({ player }: Props) {
  const { isSaved, savePlayer, removePlayer } = useSavedPlayers()
  const saved = isSaved(player.slug)
  const [potential, setPotential] = useState<string | null>(null)
  const [age, setAge] = useState<number | null>(null)
  const [potentialLoading, setPotentialLoading] = useState(true)
  const [contract, setContract] = useState<ContractEntry | null>(null)

  useEffect(() => {
    fetch(`/api/players/${player.slug}/potential`)
      .then(r => r.json())
      .then(d => { setPotential(d.potential ?? null); setAge(d.age ?? null) })
      .catch(() => { setPotential(null); setAge(null) })
      .finally(() => setPotentialLoading(false))
    fetch(`/api/players/${player.slug}/contract`)
      .then(r => r.json())
      .then(d => setContract(d.data ?? null))
      .catch(() => {})
  }, [player.slug])

  const badgesByTier = TIER_ORDER.reduce<Record<string, string[]>>((acc, tier) => {
    const names = (player.badges?.list ?? []).filter(b => b.tier === tier).map(b => b.name)
    if (names.length > 0) acc[tier] = names
    return acc
  }, {})

  const totalBadges = player.badges?.list?.length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

        {/* Hero */}
        <div
          className="rounded-xl p-6 flex flex-col sm:flex-row items-start gap-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="font-display text-8xl font-black leading-none" style={{ color: ovrColor(player.overall) }}>
            {player.overall}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-4xl font-bold tracking-wide leading-tight" style={{ color: 'var(--text)' }}>
              {player.name}
            </h1>
            <p className="text-base mt-1" style={{ color: 'var(--text-sec)' }}>{player.team}</p>
            {player.archetype && (
              <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--gold)' }}>{player.archetype}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {player.positions.map(pos => (
                <span
                  key={pos}
                  className="text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider"
                  style={{ background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border)' }}
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>Potenziale</div>
              {potentialLoading ? (
                <div className="w-12 h-8 rounded animate-pulse" style={{ background: 'var(--border)' }} />
              ) : potential ? (
                <div className={`font-display text-4xl font-black ${POTENTIAL_STYLE[potential] ?? 'text-white'}`}>{potential}</div>
              ) : (
                <div className="text-2xl" style={{ color: 'var(--text-dim)' }}>—</div>
              )}
            </div>
            <button
              onClick={() => saved ? removePlayer(player.slug) : savePlayer(player)}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={saved
                ? { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                : { background: 'rgba(232,160,32,0.12)', color: 'var(--gold)', border: '1px solid rgba(232,160,32,0.3)' }
              }
            >
              {saved ? 'Rimuovi dalla lista' : 'Aggiungi alla lista'}
            </button>
          </div>
        </div>

        {/* Info fisiche */}
        <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-sec)' }}>
            Informazioni
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['Altezza', player.height],
              ['Peso', player.weight],
              ['Apertura alare', player.wingspan],
              ['Università', player.college],
              ['Versione', player.gameVersion],
              ['Età', age != null ? `${age} anni` : null],
              ['Contratto', contract ? `${contract.years_remaining} ${contract.years_remaining === 1 ? 'anno' : 'anni'}` : contract === null ? 'Free Agent' : null],
              ['Opzione', contract?.salaries[0]?.note === 'PO' ? 'Player Option' : contract?.salaries[0]?.note === 'TO' ? 'Team Option' : contract?.salaries[0]?.note === 'QO' ? 'Qualifying Offer' : null],
            ].map(([label, val]) => val ? (
              <div key={label as string}>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{label}</div>
                <div className="font-semibold mt-0.5 text-sm" style={{ color: 'var(--text)' }}>{val}</div>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Contratto */}
        {contract && contract.salaries.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-sec)' }}>
              Contratto <span className="font-normal normal-case tracking-normal" style={{ color: 'var(--text-dim)' }}>({contract.years_remaining} {contract.years_remaining === 1 ? 'anno' : 'anni'})</span>
            </h2>
            <div className="space-y-1.5">
              {contract.salaries.map(s => {
                const millions = (s.amount / 1_000_000).toFixed(1)
                return (
                  <div
                    key={s.year}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-sm font-semibold font-display tracking-wider" style={{ color: 'var(--text-sec)' }}>
                      {s.year}
                    </span>
                    <div className="flex items-center gap-2">
                      {s.note && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                          style={s.note === 'PO'
                            ? { background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }
                            : { background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.3)' }
                          }
                        >
                          {s.note === 'PO' ? 'Player Option' : 'Team Option'}
                        </span>
                      )}
                      <span className="font-display text-base font-bold tabular-nums" style={{ color: 'var(--gold)' }}>
                        ${millions}M
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Storico rating */}
        {player.ratingHistory && player.ratingHistory.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-sec)' }}>
              Storico Rating
            </h2>
            <div className="flex flex-wrap gap-2">
              {player.ratingHistory.map(h => (
                <div
                  key={h.gameVersion}
                  className="text-center rounded-lg px-3 py-2 min-w-[64px]"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                >
                  <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{h.gameVersion}</div>
                  <div className="font-display text-xl font-bold leading-tight" style={{ color: ovrColor(h.overall) }}>
                    {h.overall}
                  </div>
                  {h.delta !== undefined && h.delta !== 0 && (
                    <div className="text-[10px] font-semibold" style={{ color: h.delta > 0 ? '#22c55e' : '#ef4444' }}>
                      {h.delta > 0 ? `+${h.delta}` : h.delta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attributi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ATTR_SECTIONS.map(section => (
            <div
              key={section.title}
              className="rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="font-display text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-sec)' }}>
                {section.title}
              </h2>
              <div className="space-y-2.5">
                {section.attrs.map(({ key, label }) => {
                  const val = player.attributes[key]
                  if (val === undefined) return null
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs w-36 shrink-0" style={{ color: 'var(--text-sec)' }}>{label}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${val}%`, background: barColor(val) }}
                        />
                      </div>
                      <span
                        className="text-xs w-7 text-right font-bold font-[tabular-nums]"
                        style={{ color: 'var(--text)' }}
                      >
                        {val}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        {totalBadges > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-sec)' }}>
              Badge <span className="font-normal normal-case tracking-normal" style={{ color: 'var(--text-dim)' }}>({totalBadges})</span>
            </h2>

            {/* Contatori per tier */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
              {TIER_ORDER.map(tier => {
                const count = badgesByTier[tier]?.length ?? 0
                const s = BADGE_STYLES[tier]
                return (
                  <div
                    key={tier}
                    className="flex flex-col items-center justify-center py-3 rounded-xl"
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      boxShadow: s.shadow,
                      opacity: count === 0 ? 0.3 : 1,
                    }}
                  >
                    <span
                      className="font-display text-5xl font-black leading-none tabular-nums"
                      style={{ color: s.color }}
                    >
                      {count}
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-widest font-bold mt-1.5"
                      style={{ color: s.color }}
                    >
                      {tier}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Lista badge per tier */}
            <div className="space-y-4">
              {TIER_ORDER.map(tier => {
                const list = badgesByTier[tier]
                if (!list) return null
                const s = BADGE_STYLES[tier]
                return (
                  <div key={tier}>
                    <div className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--text-dim)' }}>
                      {tier}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map(badge => (
                        <span
                          key={badge}
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                            boxShadow: s.shadow,
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
