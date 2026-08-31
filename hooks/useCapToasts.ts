'use client'

import { useEffect, useRef, useState } from 'react'
import { Player } from '@/types/nba'
import type { ContractEntry } from '@/app/api/contracts/route'
import type { ToastMessage } from '@/components/Toast'
import { analyzeTeam, SalaryStatus } from '@/lib/nba/capAnalyzer'
import { CURRENT_SEASON } from '@/lib/nba/seasonRules'
import { matchContract } from '@/lib/nba/matchContract'

const STATUS_TOAST: Record<SalaryStatus, Omit<ToastMessage, 'id'>> = {
  BELOW_FLOOR:        { text: 'Sotto il Salary Floor',     sub: `Floor: $${(CURRENT_SEASON.salaryFloor/1e6).toFixed(2)}M`,   color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.35)' },
  UNDER_CAP:          { text: 'Sotto il Salary Cap',       sub: `Cap: $${(CURRENT_SEASON.salaryCap/1e6).toFixed(2)}M`,       color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)'  },
  OVER_CAP_UNDER_TAX: { text: 'Sopra il Salary Cap',       sub: 'Ancora sotto la Luxury Tax',                                color: '#facc15', bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.35)' },
  LUXURY_TAX:         { text: 'Luxury Tax Line superata!', sub: `Tax: $${(CURRENT_SEASON.luxuryTaxLine/1e6).toFixed(2)}M`,   color: '#f97316', bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)'  },
  FIRST_APRON:        { text: 'First Apron superato!',     sub: `$${(CURRENT_SEASON.firstApron/1e6).toFixed(2)}M — restrizioni attive`,  color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)'   },
  SECOND_APRON:       { text: 'Second Apron superato!',    sub: `$${(CURRENT_SEASON.secondApron/1e6).toFixed(2)}M — massime restrizioni`, color: '#dc2626', bg: 'rgba(220,38,38,0.18)', border: 'rgba(220,38,38,0.45)'  },
}

export function useCapToasts(savedPlayers: Player[], contracts: ContractEntry[]) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const prevStatus = useRef<SalaryStatus | null>(null)
  const toastId = useRef(0)

  useEffect(() => {
    if (contracts.length === 0 || savedPlayers.length === 0) {
      prevStatus.current = null
      return
    }
    const teamSalary = savedPlayers.reduce((sum, p) => {
      const c = matchContract(p.name, contracts)
      return sum + (c?.salaries[0]?.amount ?? 0)
    }, 0)
    const { salaryStatus } = analyzeTeam(teamSalary, CURRENT_SEASON)
    if (prevStatus.current !== null && prevStatus.current !== salaryStatus) {
      const cfg = STATUS_TOAST[salaryStatus]
      setToasts(prev => [...prev, { id: ++toastId.current, ...cfg }])
    }
    prevStatus.current = salaryStatus
  }, [savedPlayers, contracts])

  function dismissToast(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, dismissToast }
}
