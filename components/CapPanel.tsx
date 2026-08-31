'use client'

import { useMemo } from 'react'
import { analyzeTeam, CapAnalysis, SalaryStatus } from '@/lib/nba/capAnalyzer'
import { CURRENT_SEASON } from '@/lib/nba/seasonRules'

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return `$${(n / 1_000).toFixed(0)}K`
}

function fmtRoom(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '+' : '-'
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  return `${sign}$${(abs / 1_000).toFixed(0)}K`
}

const STATUS_CONFIG: Record<SalaryStatus, { label: string; color: string; bg: string; border: string }> = {
  BELOW_FLOOR:       { label: 'SOTTO IL FLOOR',   color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)' },
  UNDER_CAP:         { label: 'SOTTO IL CAP',     color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)' },
  OVER_CAP_UNDER_TAX:{ label: 'SOPRA CAP / SOTTO TAX', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
  LUXURY_TAX:        { label: 'LUXURY TAX',       color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)' },
  FIRST_APRON:       { label: 'FIRST APRON',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)' },
  SECOND_APRON:      { label: 'SECOND APRON',     color: '#dc2626', bg: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.4)' },
}

const MLE_LABEL: Record<string, string> = {
  NON_TAXPAYER_MLE: 'Non-Taxpayer MLE',
  TAXPAYER_MLE:     'Taxpayer MLE',
  ROOM_MLE:         'Room MLE',
}

interface LineProps {
  label: string
  value: string
  room: number
  highlight?: boolean
}

function ThresholdLine({ label, value, room, highlight }: LineProps) {
  const over = room < 0
  return (
    <div className="flex items-center justify-between text-xs py-1" style={{ borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: highlight ? 'var(--text)' : 'var(--text-sec)' }}>{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-display font-bold tabular-nums" style={{ color: highlight ? 'var(--gold)' : 'var(--text-sec)' }}>
          {value}
        </span>
        <span
          className="font-display text-[11px] font-bold tabular-nums w-20 text-right"
          style={{ color: over ? '#f87171' : '#4ade80' }}
        >
          {fmtRoom(room)}
        </span>
      </div>
    </div>
  )
}

interface Props {
  teamSalaries: number[]
}

export default function CapPanel({ teamSalaries }: Props) {
  const teamSalary = useMemo(() => teamSalaries.reduce((s, n) => s + n, 0), [teamSalaries])
  const analysis: CapAnalysis = useMemo(() => analyzeTeam(teamSalary, CURRENT_SEASON), [teamSalary])
  const cfg = STATUS_CONFIG[analysis.salaryStatus]
  const rules = CURRENT_SEASON
  const mleValue = analysis.availableMLE ? rules.exceptions[
    analysis.availableMLE === 'NON_TAXPAYER_MLE' ? 'nonTaxpayerMLE' :
    analysis.availableMLE === 'TAXPAYER_MLE'     ? 'taxpayerMLE' : 'roomMLE'
  ] : null

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border2)', background: 'var(--surface2)' }}>
      {/* Header — team salary */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="text-[9px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-dim)' }}>
          Salario totale rosa · {rules.season}
        </div>
        <div className="flex items-end justify-between">
          <div className="font-display text-3xl font-black leading-none" style={{ color: 'var(--text)' }}>
            {fmt(teamSalary)}
          </div>
          <span
            className="text-[10px] font-display font-black px-2 py-1 rounded tracking-wider"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Progress bar vs second apron */}
        <div className="mt-2.5">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (teamSalary / rules.secondApron) * 100).toFixed(1)}%`,
                background: cfg.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Thresholds */}
      <div className="px-4 py-2">
        {analysis.belowFloorBy > 0 && (
          <div className="text-xs mb-2 px-2 py-1.5 rounded" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}>
            Mancano {fmt(analysis.belowFloorBy)} al floor
          </div>
        )}
        {analysis.capSpace > 0 && (
          <div className="text-xs mb-2 px-2 py-1.5 rounded flex items-center justify-between" style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            <span>Cap space disponibile</span>
            <span className="font-display font-bold">{fmt(analysis.capSpace)}</span>
          </div>
        )}
        <ThresholdLine label="Salary Cap"    value={fmt(rules.salaryCap)}      room={analysis.capSpace > 0 ? analysis.capSpace : -analysis.overCapBy} />
        <ThresholdLine label="Luxury Tax"    value={fmt(rules.luxuryTaxLine)}  room={analysis.luxuryTaxRoom}   highlight={analysis.luxuryTaxRoom < 0} />
        <ThresholdLine label="First Apron"   value={fmt(rules.firstApron)}     room={analysis.firstApronRoom}  highlight={analysis.firstApronRoom < 0} />
        <ThresholdLine label="Second Apron"  value={fmt(rules.secondApron)}    room={analysis.secondApronRoom} highlight={analysis.secondApronRoom < 0} />
      </div>

      {/* MLE */}
      {analysis.availableMLE && mleValue && (
        <div className="px-4 pb-3">
          <div
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-dim)' }}
          >
            <span style={{ color: 'var(--text-sec)' }}>Eccezione disponibile</span>
            <div className="text-right">
              <span className="font-display font-bold" style={{ color: 'var(--gold)' }}>{MLE_LABEL[analysis.availableMLE]}</span>
              <span className="ml-2 tabular-nums font-bold" style={{ color: 'var(--gold)' }}>{fmt(mleValue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
