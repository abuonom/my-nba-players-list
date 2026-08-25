'use client'

import { useState } from 'react'
import { PlayerFilters } from '@/types/nba'

interface Props {
  filters: PlayerFilters
  teams: string[]
  archetypes: string[]
  onChange: (filters: PlayerFilters) => void
  onReset: () => void
}

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

const ATTR_GROUPS = [
  {
    label: 'Tiro',
    attrs: [
      { key: 'threePointShot', label: '3 Punti' },
      { key: 'midRangeShot', label: 'Mid Range' },
      { key: 'closeShot', label: 'Close Shot' },
      { key: 'freeThrow', label: 'Tiro Libero' },
      { key: 'shotIQ', label: 'Shot IQ' },
      { key: 'offensiveConsistency', label: 'Consistenza Off.' },
    ],
  },
  {
    label: 'Finishing',
    attrs: [
      { key: 'drivingLayup', label: 'Layup' },
      { key: 'standingDunk', label: 'Standing Dunk' },
      { key: 'drivingDunk', label: 'Driving Dunk' },
      { key: 'postHook', label: 'Post Hook' },
      { key: 'postFade', label: 'Post Fade' },
      { key: 'postControl', label: 'Post Control' },
      { key: 'drawFoul', label: 'Draw Foul' },
      { key: 'hands', label: 'Mani' },
    ],
  },
  {
    label: 'Playmaking',
    attrs: [
      { key: 'ballHandle', label: 'Ball Handle' },
      { key: 'speedWithBall', label: 'Vel. con Palla' },
      { key: 'passAccuracy', label: 'Passaggio' },
      { key: 'passVision', label: 'Visione' },
      { key: 'passIQ', label: 'Pass IQ' },
      { key: 'passPerception', label: 'Percezione' },
    ],
  },
  {
    label: 'Difesa',
    attrs: [
      { key: 'interiorDefense', label: 'Int. Difesa' },
      { key: 'perimeterDefense', label: 'Per. Difesa' },
      { key: 'steal', label: 'Intercetto' },
      { key: 'block', label: 'Stoppata' },
      { key: 'lateralQuickness', label: 'Lat. Quickness' },
      { key: 'helpDefenseIQ', label: 'Help Def IQ' },
      { key: 'defensiveConsistency', label: 'Consistenza Dif.' },
      { key: 'defensiveRebound', label: 'Rimbalzo Dif.' },
    ],
  },
  {
    label: 'Atletismo',
    attrs: [
      { key: 'speed', label: 'Velocità' },
      { key: 'agility', label: 'Agilità' },
      { key: 'strength', label: 'Forza' },
      { key: 'vertical', label: 'Verticale' },
      { key: 'stamina', label: 'Resistenza' },
      { key: 'hustle', label: 'Grinta' },
      { key: 'durability', label: 'Durabilità' },
      { key: 'offensiveRebound', label: 'Rimbalzo Off.' },
    ],
  },
]

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }} className="pb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-2 text-left group"
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-sec)' }}
        >
          {title}
        </span>
        <span
          className="text-xs transition-transform duration-200"
          style={{ color: 'var(--text-dim)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  )
}

const inputStyle = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: '6px',
  padding: '5px 10px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
}

export default function Filters({ filters, teams, archetypes, onChange, onReset }: Props) {
  const set = (key: string, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined })
  }

  const activeCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  return (
    <div
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}
      className="p-4 space-y-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold tracking-wide" style={{ color: 'var(--text)' }}>Filtri</span>
          {activeCount > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--gold)', color: '#000' }}
            >
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-[11px] font-medium transition-colors"
          style={{ color: 'var(--text-sec)' }}
        >
          Reset
        </button>
      </div>

      {/* Ricerca */}
      <Section title="Ricerca" defaultOpen>
        <input
          type="text"
          placeholder="Nome giocatore..."
          value={filters.search ?? ''}
          onChange={e => set('search', e.target.value)}
          style={inputStyle}
        />
      </Section>

      {/* Posizione */}
      <Section title="Posizione" defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => set('position', filters.position === pos ? undefined : pos)}
              className="text-xs font-bold px-3 py-1.5 rounded transition-colors"
              style={filters.position === pos
                ? { background: 'var(--gold)', color: '#000', border: '1px solid var(--gold)' }
                : { background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border)' }
              }
            >
              {pos}
            </button>
          ))}
        </div>
      </Section>

      {/* Team */}
      <Section title="Team" defaultOpen>
        <select
          value={filters.team ?? ''}
          onChange={e => set('team', e.target.value)}
          style={selectStyle}
        >
          <option value="">Tutti i team</option>
          {teams.map((team, i) => (
            <option key={`${team}-${i}`} value={team}>{team}</option>
          ))}
        </select>
      </Section>

      {/* Archetype */}
      <Section title="Archetype">
        <select
          value={filters.archetype ?? ''}
          onChange={e => set('archetype', e.target.value)}
          style={selectStyle}
        >
          <option value="">Tutti gli archetype</option>
          {archetypes.map((a, i) => (
            <option key={`${a}-${i}`} value={a}>{a}</option>
          ))}
        </select>
      </Section>

      {/* OVR */}
      <Section title="Overall">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0} max={99}
            value={filters.minRating ?? ''}
            onChange={e => set('minRating', e.target.value ? Number(e.target.value) : undefined)}
            style={{ ...inputStyle, width: '50%' }}
          />
          <input
            type="number"
            placeholder="Max"
            min={0} max={99}
            value={filters.maxRating ?? ''}
            onChange={e => set('maxRating', e.target.value ? Number(e.target.value) : undefined)}
            style={{ ...inputStyle, width: '50%' }}
          />
        </div>
      </Section>

      {/* Attributi */}
      {ATTR_GROUPS.map(group => (
        <Section key={group.label} title={group.label}>
          <div className="space-y-2">
            {group.attrs.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs shrink-0 w-28" style={{ color: 'var(--text-sec)' }}>{label}</label>
                <input
                  type="number"
                  placeholder="Min"
                  min={0} max={99}
                  value={(filters[`${key}_gte`] as number) ?? ''}
                  onChange={e => set(`${key}_gte`, e.target.value ? Number(e.target.value) : undefined)}
                  style={{ ...inputStyle, padding: '4px 8px' }}
                />
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}
