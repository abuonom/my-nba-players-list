export interface NBASeasonRules {
  season: string
  salaryFloor: number
  salaryCap: number
  luxuryTaxLine: number
  firstApron: number
  secondApron: number
  exceptions: {
    nonTaxpayerMLE: number
    taxpayerMLE: number
    roomMLE: number
  }
}

export const SEASON_2026_27: NBASeasonRules = {
  season: '2026-27',
  salaryFloor:    148_465_000,
  salaryCap:      164_961_000,
  luxuryTaxLine:  200_428_000,
  firstApron:     209_015_000,
  secondApron:    221_686_000,
  exceptions: {
    nonTaxpayerMLE: 15_044_000,
    taxpayerMLE:     6_064_000,
    roomMLE:         9_366_000,
  },
}

export const CURRENT_SEASON = SEASON_2026_27
