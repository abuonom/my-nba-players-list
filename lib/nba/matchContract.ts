import type { ContractEntry } from '@/app/api/contracts/route'

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

export function matchContract(name: string, contracts: ContractEntry[]): ContractEntry | null {
  const n = norm(name)
  return (
    contracts.find(c => norm(c.name) === n) ??
    contracts.find(c => norm(c.name).includes(n) || n.includes(norm(c.name))) ??
    null
  )
}
