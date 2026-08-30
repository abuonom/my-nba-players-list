'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Player, PlayerFilters } from '@/types/nba'
import PlayerCard from '@/components/PlayerCard'
import Filters from '@/components/Filters'
import SavedList from '@/components/SavedList'
import Toast, { ToastMessage } from '@/components/Toast'
import { useSavedPlayers } from '@/hooks/useSavedPlayers'
import { usePotentials } from '@/hooks/usePotentials'
import { createClient } from '@/lib/supabase/client'
import type { ContractEntry } from '@/app/api/contracts/route'
import { analyzeTeam, SalaryStatus } from '@/lib/nba/capAnalyzer'
import { CURRENT_SEASON } from '@/lib/nba/seasonRules'

function matchContract(name: string, contracts: ContractEntry[]): ContractEntry | null {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const n = norm(name)
  return contracts.find(c => norm(c.name) === n) ??
    contracts.find(c => norm(c.name).includes(n) || n.includes(norm(c.name))) ??
    null
}

function applyClientFilters(players: Player[], f: PlayerFilters): Player[] {
  let result = [...players]
  if (f.search) {
    const q = f.search.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }
  if (f.archetype) result = result.filter(p => p.archetype === f.archetype)
  for (const [key, value] of Object.entries(f)) {
    if (key.endsWith('_gte') && value !== undefined) {
      const attr = key.replace('_gte', '')
      result = result.filter(p => (p.attributes[attr] ?? 0) >= Number(value))
    }
    if (key.endsWith('_lte') && value !== undefined) {
      const attr = key.replace('_lte', '')
      result = result.filter(p => (p.attributes[attr] ?? 99) <= Number(value))
    }
  }
  return result.sort((a, b) => b.overall - a.overall)
}

function LoadingScreen({ step, pct }: { step: string; pct: number }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center">
        <div className="font-display text-4xl font-black tracking-widest" style={{ color: 'var(--gold)' }}>
          GOAT LEAGUE
        </div>
        <div className="font-display text-2xl font-bold tracking-wide mt-1" style={{ color: 'var(--text)' }}>
          PROJECT
        </div>
      </div>

      <div className="w-64 space-y-3">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: 'var(--gold)' }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: 'var(--text-sec)' }}>{step}</div>
          <div className="text-sm font-bold font-display" style={{ color: 'var(--gold)' }}>{pct}%</div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [filters, setFilters] = useState<PlayerFilters>({})
  const [playersLoading, setPlayersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [contracts, setContracts] = useState<ContractEntry[]>([])
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const prevStatus = useRef<SalaryStatus | null>(null)
  const toastId = useRef(0)

  const STATUS_TOAST: Record<SalaryStatus, { text: string; sub: string; color: string; bg: string; border: string }> = {
    BELOW_FLOOR:        { text: 'Sotto il Salary Floor', sub: `Floor: $${(CURRENT_SEASON.salaryFloor/1e6).toFixed(2)}M`, color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.35)' },
    UNDER_CAP:          { text: 'Sotto il Salary Cap',   sub: `Cap: $${(CURRENT_SEASON.salaryCap/1e6).toFixed(2)}M`,   color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)' },
    OVER_CAP_UNDER_TAX: { text: 'Sopra il Salary Cap',   sub: `Ancora sotto la Luxury Tax`,                             color: '#facc15', bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.35)' },
    LUXURY_TAX:         { text: 'Luxury Tax Line superata!', sub: `Tax: $${(CURRENT_SEASON.luxuryTaxLine/1e6).toFixed(2)}M`, color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
    FIRST_APRON:        { text: 'First Apron superato!',  sub: `$${(CURRENT_SEASON.firstApron/1e6).toFixed(2)}M — restrizioni attive`, color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)' },
    SECOND_APRON:       { text: 'Second Apron superato!', sub: `$${(CURRENT_SEASON.secondApron/1e6).toFixed(2)}M — massime restrizioni`, color: '#dc2626', bg: 'rgba(220,38,38,0.18)', border: 'rgba(220,38,38,0.45)' },
  }

  function pushToast(status: SalaryStatus) {
    const cfg = STATUS_TOAST[status]
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, ...cfg }])
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const { savedPlayers, savePlayer, removePlayer, isSaved, clearAll } = useSavedPlayers()

  const fetchPlayers = useCallback(async (f: PlayerFilters) => {
    setPlayersLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (f.position) params.set('position', f.position)
      if (f.team) params.set('team', f.team)
      if (f.minRating !== undefined) params.set('minRating', String(f.minRating))
      if (f.maxRating !== undefined) params.set('maxRating', String(f.maxRating))
      const res = await fetch(`/api/players?${params.toString()}`)
      const data = await res.json()
      if (!data.success) { setError(data.error?.message ?? 'Errore nel caricamento'); return }
      setAllPlayers(data.data)
    } catch { setError('Errore di rete') }
    finally { setPlayersLoading(false) }
  }, [])

  const serverFiltersKey = JSON.stringify({
    position: filters.position, team: filters.team,
    minRating: filters.minRating, maxRating: filters.maxRating,
  })

  useEffect(() => {
    fetchPlayers(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverFiltersKey])

  useEffect(() => {
    fetch('/api/teams').then(r => r.json()).then(data => {
      if (data.success) {
        const names: string[] = [...new Set<string>(data.data.map((t: { name: string }) => t.name))].sort()
        setTeams(names)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/contracts').then(r => r.json()).then(data => {
      if (data.success) setContracts(data.data)
    }).catch(() => {})
  }, [])

  // Rileva cambio di status cap e mostra toast
  useEffect(() => {
    if (contracts.length === 0 || savedPlayers.length === 0) return
    const teamSalary = savedPlayers.reduce((sum, p) => {
      const contract = matchContract(p.name, contracts)
      return sum + (contract?.salaries[0]?.amount ?? 0)
    }, 0)
    const { salaryStatus } = analyzeTeam(teamSalary, CURRENT_SEASON)
    if (prevStatus.current !== null && prevStatus.current !== salaryStatus) {
      pushToast(salaryStatus)
    }
    prevStatus.current = salaryStatus
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPlayers, contracts])

  const archetypes = useMemo(() =>
    [...new Set(allPlayers.map(p => p.archetype).filter(Boolean) as string[])].sort()
  , [allPlayers])

  const players = applyClientFilters(allPlayers, filters)
  const playerSlugs = useMemo(() => players.map(p => p.slug), [players])
  const { data: potentials, loading: potentialsLoading, progress } = usePotentials(playerSlugs)

  // Gate: show page only when players are loaded AND all potentials have an entry
  const allPotentialsReady = !playersLoading && players.length > 0 &&
    players.every(p => potentials.has(p.slug))

  useEffect(() => {
    if (!initialLoadDone && allPotentialsReady) {
      setInitialLoadDone(true)
    }
  }, [allPotentialsReady, initialLoadDone])

  // 0–20% = players, 20–100% = potentials
  const pct = playersLoading
    ? 10
    : progress.total === 0
      ? 20
      : Math.round(20 + (progress.loaded / progress.total) * 80)

  const loadStep = playersLoading
    ? 'Caricamento giocatori...'
    : `Potenziali ${progress.loaded} / ${progress.total}`

  if (!initialLoadDone) {
    return <LoadingScreen step={loadStep} pct={pct} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-wider" style={{ color: 'var(--gold)' }}>
                GOAT LEAGUE
              </h1>
              <span className="font-display text-2xl font-bold tracking-wide" style={{ color: 'var(--text)' }}>
                PROJECT
              </span>
            </div>
            <a
              href="/draft-builder"
              className="font-display text-sm font-bold tracking-widest uppercase px-3 py-1.5 rounded transition-colors"
              style={{ color: 'var(--gold)', border: '1px solid var(--gold-dim)', background: 'var(--gold-bg)' }}
            >
              Draft Builder
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="lg:hidden text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              style={{ background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border)' }}
            >
              Filtri
            </button>
            <button
              onClick={() => setShowSaved(true)}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              style={{ background: 'rgba(232,160,32,0.12)', color: 'var(--gold)', border: '1px solid rgba(232,160,32,0.3)' }}
            >
              Il mio Squad
              {savedPlayers.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--gold)', color: '#000' }}>
                  {savedPlayers.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              style={{ background: 'var(--surface2)', color: 'var(--text-sec)', border: '1px solid var(--border)' }}
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5">
        {/* Sidebar */}
        <aside className={`w-60 shrink-0 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-16 max-h-[calc(100vh-4.5rem)] overflow-y-auto pr-1">
            <Filters
              filters={filters}
              teams={teams}
              archetypes={archetypes}
              onChange={setFilters}
              onReset={() => setFilters({})}
            />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div
            className="hidden md:flex items-center gap-3 px-4 pb-2 mb-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="w-14 text-center">OVR</div>
            <div className="flex-1">Giocatore</div>
            <div className="hidden md:grid grid-cols-3 gap-x-5 w-[200px]">
              <span>3PT</span><span>SPD</span><span>BLK</span>
              <span>BH</span><span>DEF</span><span>STL</span>
            </div>
            <div className="w-10 text-center">POT</div>
            <div className="hidden lg:block w-28 text-right">Contratto</div>
            <div className="w-16" />
          </div>

          <p className="text-xs mb-3 mt-1" style={{ color: 'var(--text-dim)' }}>
            {players.length} giocatori
          </p>

          {error && (
            <div className="rounded-lg p-4 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            {players.map(player => (
              <PlayerCard
                key={player.slug}
                player={player}
                isSaved={isSaved(player.slug)}
                onSave={savePlayer}
                onRemove={removePlayer}
                potential={potentials.get(player.slug)?.potential}
                age={potentials.get(player.slug)?.age}
                contract={contracts.length > 0 ? matchContract(player.name, contracts) : undefined}
              />
            ))}
            {players.length === 0 && !error && (
              <div className="text-center py-20 text-sm" style={{ color: 'var(--text-sec)' }}>
                Nessun giocatore trovato con questi filtri
              </div>
            )}
          </div>
        </main>
      </div>

      <Toast
        messages={toasts}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />

      {showSaved && (
        <SavedList
          players={savedPlayers}
          contracts={contracts}
          onRemove={removePlayer}
          onClearAll={clearAll}
          onClose={() => setShowSaved(false)}
        />
      )}
    </div>
  )
}
