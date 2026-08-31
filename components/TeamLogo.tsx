'use client'

import { useState } from 'react'
import { teamLogoUrl, teamAbbreviation } from '@/lib/nba/teamLogos'

interface Props {
  team: string
  size?: number
  className?: string
  showAbbr?: boolean
}

export default function TeamLogo({ team, size = 20, className = '', showAbbr = false }: Props) {
  const [failed, setFailed] = useState(false)
  const url = teamLogoUrl(team)
  const abbr = teamAbbreviation(team)

  if (team === 'Free Agency') {
    return (
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
        style={{ background: 'var(--surface2)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}
      >
        FA
      </span>
    )
  }

  if (!url || failed) {
    return <span className={`text-xs ${className}`} style={{ color: 'var(--text-sec)' }}>{team}</span>
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <img
        src={url}
        alt={team}
        title={team}
        width={size}
        height={size}
        style={{ objectFit: 'contain', display: 'block' }}
        onError={() => setFailed(true)}
      />
      {showAbbr && abbr && (
        <span className="text-[10px] font-bold tracking-wider font-display" style={{ color: 'var(--text-sec)' }}>
          {abbr}
        </span>
      )}
    </span>
  )
}
