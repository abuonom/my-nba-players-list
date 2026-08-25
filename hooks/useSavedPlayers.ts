'use client'

import { useState, useEffect } from 'react'
import { Player } from '@/types/nba'

const STORAGE_KEY = 'nba-saved-players'

export function useSavedPlayers() {
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSavedPlayers(JSON.parse(stored))
    } catch {}
  }, [])

  const savePlayer = (player: Player) => {
    setSavedPlayers(prev => {
      if (prev.find(p => p.slug === player.slug)) return prev
      const updated = [...prev, player]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const removePlayer = (slug: string) => {
    setSavedPlayers(prev => {
      const updated = prev.filter(p => p.slug !== slug)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const isSaved = (slug: string) => savedPlayers.some(p => p.slug === slug)

  return { savedPlayers, savePlayer, removePlayer, isSaved }
}
