'use client'

export interface AttrFilter {
  key: string
  min: number
}

export const ATTRS: { key: string; label: string; group: string }[] = [
  // Tiro
  { key: 'threePointShot',        label: '3 Punti',           group: 'Tiro' },
  { key: 'midRangeShot',          label: 'Mid Range',         group: 'Tiro' },
  { key: 'closeShot',             label: 'Close Shot',        group: 'Tiro' },
  { key: 'freeThrow',             label: 'Tiro Libero',       group: 'Tiro' },
  { key: 'shotIQ',                label: 'Shot IQ',           group: 'Tiro' },
  { key: 'offensiveConsistency',  label: 'Consistenza Off.',  group: 'Tiro' },
  // Finishing
  { key: 'drivingLayup',   label: 'Layup',          group: 'Finishing' },
  { key: 'drivingDunk',    label: 'Driving Dunk',   group: 'Finishing' },
  { key: 'standingDunk',   label: 'Standing Dunk',  group: 'Finishing' },
  { key: 'postHook',       label: 'Post Hook',      group: 'Finishing' },
  { key: 'postFade',       label: 'Post Fade',      group: 'Finishing' },
  { key: 'postControl',    label: 'Post Control',   group: 'Finishing' },
  { key: 'drawFoul',       label: 'Draw Foul',      group: 'Finishing' },
  { key: 'hands',          label: 'Mani',           group: 'Finishing' },
  // Playmaking
  { key: 'ballHandle',      label: 'Ball Handle',     group: 'Playmaking' },
  { key: 'speedWithBall',   label: 'Vel. con Palla',  group: 'Playmaking' },
  { key: 'passAccuracy',    label: 'Passaggio',       group: 'Playmaking' },
  { key: 'passVision',      label: 'Visione',         group: 'Playmaking' },
  { key: 'passIQ',          label: 'Pass IQ',         group: 'Playmaking' },
  { key: 'passPerception',  label: 'Percezione',      group: 'Playmaking' },
  // Difesa
  { key: 'interiorDefense',       label: 'Int. Difesa',        group: 'Difesa' },
  { key: 'perimeterDefense',      label: 'Per. Difesa',        group: 'Difesa' },
  { key: 'steal',                 label: 'Intercetto',         group: 'Difesa' },
  { key: 'block',                 label: 'Stoppata',           group: 'Difesa' },
  { key: 'lateralQuickness',      label: 'Lat. Quickness',     group: 'Difesa' },
  { key: 'helpDefenseIQ',         label: 'Help Def IQ',        group: 'Difesa' },
  { key: 'defensiveConsistency',  label: 'Consistenza Dif.',   group: 'Difesa' },
  { key: 'defensiveRebound',      label: 'Rimbalzo Dif.',      group: 'Difesa' },
  // Atletismo
  { key: 'speed',             label: 'Velocità',      group: 'Atletismo' },
  { key: 'agility',           label: 'Agilità',       group: 'Atletismo' },
  { key: 'strength',          label: 'Forza',         group: 'Atletismo' },
  { key: 'vertical',          label: 'Verticale',     group: 'Atletismo' },
  { key: 'stamina',           label: 'Resistenza',    group: 'Atletismo' },
  { key: 'hustle',            label: 'Grinta',        group: 'Atletismo' },
  { key: 'durability',        label: 'Durabilità',    group: 'Atletismo' },
  { key: 'offensiveRebound',  label: 'Rimbalzo Off.', group: 'Atletismo' },
]

const MAX_FILTERS = 4

interface Props {
  value: AttrFilter[]
  onChange: (v: AttrFilter[]) => void
}

export default function AttributeFilterPicker({ value, onChange }: Props) {
  function addRow() {
    if (value.length >= MAX_FILTERS) return
    // Pick first attr not already selected
    const usedKeys = new Set(value.map(f => f.key))
    const next = ATTRS.find(a => !usedKeys.has(a.key))
    if (!next) return
    onChange([...value, { key: next.key, min: 75 }])
  }

  function removeRow(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function setKey(idx: number, key: string) {
    onChange(value.map((f, i) => i === idx ? { ...f, key } : f))
  }

  function setMin(idx: number, min: number) {
    onChange(value.map((f, i) => i === idx ? { ...f, min } : f))
  }

  const usedKeys = new Set(value.map(f => f.key))

  return (
    <div className="space-y-2">
      {value.map((f, idx) => {
        const attr = ATTRS.find(a => a.key === f.key)
        return (
          <div key={idx} className="flex items-center gap-2">
            {/* Attribute select */}
            <select
              value={f.key}
              onChange={e => setKey(idx, e.target.value)}
              className="flex-1 text-xs rounded-lg outline-none min-w-0"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
                padding: '5px 8px',
                cursor: 'pointer',
              }}
            >
              {/* Current attr always available in its own slot */}
              {ATTRS.map(a => (
                <option
                  key={a.key}
                  value={a.key}
                  disabled={usedKeys.has(a.key) && a.key !== f.key}
                >
                  {a.group} · {a.label}
                </option>
              ))}
            </select>

            {/* Min value */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-dim)' }}>≥</span>
              <input
                type="number"
                min={0} max={99} step={1}
                value={f.min}
                onChange={e => {
                  const v = Math.min(99, Math.max(0, Number(e.target.value)))
                  setMin(idx, isNaN(v) ? 0 : v)
                }}
                className="w-12 text-xs text-center rounded-lg outline-none tabular-nums font-bold"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--gold-dim)',
                  color: 'var(--gold)',
                  padding: '5px 4px',
                }}
              />
            </div>

            {/* Remove */}
            <button
              onClick={() => removeRow(idx)}
              className="w-6 h-6 flex items-center justify-center rounded-lg shrink-0 text-xs transition-colors"
              style={{ color: 'var(--text-dim)', background: 'var(--surface2)', border: '1px solid var(--border)' }}
            >
              ✕
            </button>
          </div>
        )
      })}

      {value.length < MAX_FILTERS && (
        <button
          onClick={addRow}
          className="w-full text-xs font-semibold py-2 rounded-lg transition-colors"
          style={{
            background: 'var(--surface2)',
            border: '1px dashed var(--border2)',
            color: 'var(--text-sec)',
          }}
        >
          + Aggiungi attributo {value.length > 0 ? `(${value.length}/${MAX_FILTERS})` : ''}
        </button>
      )}

      {value.length === 0 && (
        <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Filtra per valore minimo su un attributo specifico.
        </p>
      )}
    </div>
  )
}
