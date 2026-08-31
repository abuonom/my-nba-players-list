'use client'

import { useState } from 'react'
import { teamLogoUrl } from '@/lib/nba/teamLogos'

interface Props {
  team: string
  size?: number
  className?: string
}

export default function TeamLogo({ team, size = 20, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const url = teamLogoUrl(team)

  if (!url || failed) {
    return <span className={`text-xs ${className}`} style={{ color: 'var(--text-sec)' }}>{team}</span>
  }

  return (
    <img
      src={url}
      alt={team}
      title={team}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  )
}
