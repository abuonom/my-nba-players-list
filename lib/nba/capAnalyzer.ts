import { NBASeasonRules } from './seasonRules'

export type SalaryStatus =
  | 'BELOW_FLOOR'
  | 'UNDER_CAP'
  | 'OVER_CAP_UNDER_TAX'
  | 'LUXURY_TAX'
  | 'FIRST_APRON'
  | 'SECOND_APRON'

export type MidLevelException =
  | 'NON_TAXPAYER_MLE'
  | 'TAXPAYER_MLE'
  | 'ROOM_MLE'
  | null

export interface CapAnalysis {
  teamSalary: number
  salaryStatus: SalaryStatus
  capSpace: number
  belowFloorBy: number
  overCapBy: number
  luxuryTaxRoom: number
  firstApronRoom: number
  secondApronRoom: number
  availableMLE: MidLevelException
}

export function getSalaryStatus(teamSalary: number, rules: NBASeasonRules): SalaryStatus {
  if (teamSalary < rules.salaryFloor)      return 'BELOW_FLOOR'
  if (teamSalary < rules.salaryCap)        return 'UNDER_CAP'
  if (teamSalary < rules.luxuryTaxLine)    return 'OVER_CAP_UNDER_TAX'
  if (teamSalary < rules.firstApron)       return 'LUXURY_TAX'
  if (teamSalary < rules.secondApron)      return 'FIRST_APRON'
  return 'SECOND_APRON'
}

export function getAvailableMLE(status: SalaryStatus): MidLevelException {
  if (status === 'BELOW_FLOOR' || status === 'UNDER_CAP') return 'ROOM_MLE'
  if (status === 'OVER_CAP_UNDER_TAX')                    return 'NON_TAXPAYER_MLE'
  if (status === 'LUXURY_TAX' || status === 'FIRST_APRON') return 'TAXPAYER_MLE'
  return null // SECOND_APRON: no standard MLE
}

export function analyzeTeam(teamSalary: number, rules: NBASeasonRules): CapAnalysis {
  const status = getSalaryStatus(teamSalary, rules)
  return {
    teamSalary,
    salaryStatus: status,
    capSpace:        Math.max(0, rules.salaryCap - teamSalary),
    belowFloorBy:    Math.max(0, rules.salaryFloor - teamSalary),
    overCapBy:       Math.max(0, teamSalary - rules.salaryCap),
    luxuryTaxRoom:   rules.luxuryTaxLine - teamSalary,
    firstApronRoom:  rules.firstApron - teamSalary,
    secondApronRoom: rules.secondApron - teamSalary,
    availableMLE:    getAvailableMLE(status),
  }
}
