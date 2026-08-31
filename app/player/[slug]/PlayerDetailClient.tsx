'use client'

import { useEffect, useState } from 'react'
import { Player } from '@/types/nba'
import { useSavedPlayers } from '@/hooks/useSavedPlayers'
import { ContractEntry } from '@/app/api/contracts/route'
import TeamLogo from '@/components/TeamLogo'

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

const BADGE_TIERS = [
  { tier: 'Legend',       color: '#fca5a5', bg: 'rgba(239,68,68,0.2)',    border: 'rgba(239,68,68,0.5)',    shadow: '0 0 8px rgba(239,68,68,0.4)' },
  { tier: 'Hall of Fame', color: '#d8b4fe', bg: 'rgba(168,85,247,0.2)',   border: 'rgba(168,85,247,0.5)',   shadow: '0 0 8px rgba(168,85,247,0.3)' },
  { tier: 'Gold',         color: '#fde047', bg: 'rgba(234,179,8,0.2)',    border: 'rgba(234,179,8,0.5)' },
  { tier: 'Silver',       color: '#cbd5e1', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' },
  { tier: 'Bronze',       color: '#fdba74', bg: 'rgba(180,83,9,0.2)',     border: 'rgba(180,83,9,0.5)' },
]

const TIER_ORDER = BADGE_TIERS.map(b => b.tier)

const POTENTIAL_STYLE: Record<string, { color: string; bg: string }> = {
  'A+': { color: '#fde047', bg: 'rgba(234,179,8,0.15)' },
  'A':  { color: '#86efac', bg: 'rgba(34,197,94,0.12)' },
  'A-': { color: '#4ade80', bg: 'rgba(34,197,94,0.08)' },
  'B+': { color: '#93c5fd', bg: 'rgba(59,130,246,0.12)' },
  'B':  { color: '#7dd3fc', bg: 'rgba(14,165,233,0.1)' },
  'B-': { color: '#60a5fa', bg: 'rgba(59,130,246,0.07)' },
  'C+': { color: '#cbd5e1', bg: 'rgba(148,163,184,0.1)' },
  'C':  { color: '#94a3b8', bg: 'rgba(100,116,139,0.1)' },
  'D':  { color: '#fca5a5', bg: 'rgba(239,68,68,0.1)' },
}

function ovrColor(ovr: number) {
  if (ovr >= 95) return 'var(--ovr-s)'
  if (ovr >= 90) return 'var(--ovr-a)'
  if (ovr >= 85) return 'var(--ovr-b)'
  if (ovr >= 80) return 'var(--ovr-c)'
  return 'var(--ovr-d)'
}

function ovrGlow(ovr: number) {
  if (ovr >= 95) return 'rgba(251,191,36,0.25)'
  if (ovr >= 90) return 'rgba(192,132,252,0.25)'
  if (ovr >= 85) return 'rgba(96,165,250,0.25)'
  if (ovr >= 80) return 'rgba(52,211,153,0.25)'
  return 'rgba(100,116,139,0.2)'
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
  const [contract, setContract] = useState<ContractEntry | null | undefined>(undefined)

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
  const potStyle = potential ? POTENTIAL_STYLE[potential] : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-3">

        {/* Hero */}
        <div
          className="rounded-xl p-5 flex flex-col sm:flex-row gap-5 items-start"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* OVR block */}
          <div
            className="flex flex-col items-center justify-center rounded-xl shrink-0"
            style={{
              width: '5.5rem', minHeight: '5.5rem',
              background: 'var(--surface2)',
              border: `2px solid ${ovrColor(player.overall)}`,
              boxShadow: `0 0 20px ${ovrGlow(player.overall)}`,
            }}
          >
            <div className="font-display text-5xl font-black leading-none tabular-nums" style={{ color: ovrColor(player.overall) }}>
              {player.overall}
            </div>
            <div className="text-[8px] uppercase tracking-widest mt-1 font-semibold" style={{ color: 'var(--text-dim)' }}>OVR</div>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide leading-tight" style={{ color: 'var(--text)' }}>
              {player.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <TeamLogo team={player.team} size={22} showAbbr />
              {age != null && (
                <>
                  <span style={{ color: 'var(--text-dim)' }}>·</span>
                  <span className="text-sm" style={{ color: 'var(--text-sec)' }}>{age} anni</span>
                </>
              )}
              {player.archetype && (
                <>
                  <span style={{ color: 'var(--text-dim)' }}>·</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--gold)' }}>{player.archetype}</span>
                </>
              )}
            </div>
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

          {/* Potential + button */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex flex-col items-center rounded-xl px-4 py-2.5"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', minWidth: '5rem' }}
            >
              <div className="text-[9px] uppercase tracking-widest mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>Potenziale</div>
              {potentialLoading ? (
                <div className="w-10 h-8 rounded animate-pulse" style={{ background: 'var(--border)' }} />
              ) : potStyle ? (
                <div
                  className="font-display text-4xl font-black px-2 rounded-lg"
                  style={{ color: potStyle.color, background: potStyle.bg }}
                >
                  {potential}
                </div>
              ) : (
                <div className="font-display text-3xl font-black" style={{ color: 'var(--text-dim)' }}>—</div>
              )}
            </div>
            <button
              onClick={() => saved ? removePlayer(player.slug) : savePlayer(player)}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
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
          <h2 className="font-display text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
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
              ['Contratto', contract === undefined ? null : contract ? `${contract.years_remaining} ${contract.years_remaining === 1 ? 'anno' : 'anni'}` : 'Free Agent'],
              ['Opzione', contract?.salaries[0]?.note === 'PO' ? 'Player Option' : contract?.salaries[0]?.note === 'TO' ? 'Team Option' : contract?.salaries[0]?.note === 'QO' ? 'Qualifying Offer' : null],
            ].map(([label, val]) => val ? (
              <div key={label as string} className="pl-2" style={{ borderLeft: '2px solid var(--border2)' }}>
                <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{label}</div>
                <div className="font-semibold mt-0.5 text-sm" style={{ color: 'var(--text)' }}>{val}</div>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Contratto */}
        {contract && contract.salaries.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-display text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
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
                    <span className="font-display text-sm font-bold tracking-wider tabular-nums" style={{ color: 'var(--text-sec)' }}>
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
            <h2 className="font-display text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
              Storico Rating
            </h2>
            <div className="flex flex-wrap gap-2">
              {player.ratingHistory.map(h => (
                <div
                  key={h.gameVersion}
                  className="flex flex-col items-center rounded-xl px-3 py-2.5 min-w-[4rem]"
                  style={{
                    background: 'var(--surface2)',
                    border: `1px solid ${ovrColor(h.overall)}40`,
                  }}
                >
                  <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>{h.gameVersion}</div>
                  <div className="font-display text-2xl font-black leading-none tabular-nums" style={{ color: ovrColor(h.overall) }}>
                    {h.overall}
                  </div>
                  {h.delta !== undefined && h.delta !== 0 ? (
                    <div
                      className="text-[10px] font-black mt-1 tabular-nums"
                      style={{ color: h.delta > 0 ? '#22c55e' : '#ef4444' }}
                    >
                      {h.delta > 0 ? `+${h.delta}` : h.delta}
                    </div>
                  ) : (
                    <div className="text-[10px] mt-1" style={{ color: 'transparent' }}>+0</div>
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
              <h2 className="font-display text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.attrs.map(({ key, label }) => {
                  const val = player.attributes[key]
                  if (val === undefined) return null
                  const color = barColor(val)
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs w-36 shrink-0" style={{ color: 'var(--text-sec)' }}>{label}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
                      </div>
                      <span
                        className="font-display text-sm font-black w-8 text-right tabular-nums"
                        style={{ color }}
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
            <h2 className="font-display text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>
              Badge <span className="font-normal normal-case tracking-normal" style={{ color: 'var(--text-dim)' }}>({totalBadges})</span>
            </h2>

            {/* Tier counters — 5 fixed slots */}
            <div className="grid grid-cols-5 gap-2 mb-5">
              {BADGE_TIERS.map(({ tier, color, bg, border, shadow }) => {
                const count = badgesByTier[tier]?.length ?? 0
                return (
                  <div
                    key={tier}
                    className="flex flex-col items-center justify-center py-3 rounded-xl"
                    style={{
                      background: count > 0 ? bg : 'var(--surface2)',
                      border: `1px solid ${count > 0 ? border : 'var(--border)'}`,
                      boxShadow: count > 0 ? shadow : 'none',
                    }}
                  >
                    <span className="font-display text-4xl font-black leading-none tabular-nums" style={{ color: count > 0 ? color : 'var(--border2)' }}>
                      {count}
                    </span>
                    <span className="text-[8px] uppercase tracking-widest font-bold mt-1.5" style={{ color: count > 0 ? color : 'var(--border2)' }}>
                      {tier === 'Hall of Fame' ? 'HOF' : tier}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Badge list per tier */}
            <div className="space-y-4">
              {BADGE_TIERS.map(({ tier, color, bg, border, shadow }) => {
                const list = badgesByTier[tier]
                if (!list) return null
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
                          style={{ background: bg, color, border: `1px solid ${border}`, boxShadow: shadow }}
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
