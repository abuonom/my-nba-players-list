'use client'

import { useState, useEffect } from 'react'
import { Player } from '@/types/nba'
import { createClient } from '@/lib/supabase/client'

export function useSavedPlayers() {
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('saved_players')
        .select('player_data')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setSavedPlayers(data.map((row: { player_data: Player }) => row.player_data))
        })
    })
  }, [])

  const savePlayer = async (player: Player) => {
    if (savedPlayers.find(p => p.slug === player.slug)) return
    setSavedPlayers(prev => [...prev, player])
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('saved_players').upsert({
      user_id: user.id,
      slug: player.slug,
      player_data: player,
    })
  }

  const removePlayer = async (slug: string) => {
    setSavedPlayers(prev => prev.filter(p => p.slug !== slug))
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('saved_players').delete().eq('user_id', user.id).eq('slug', slug)
  }

  const clearAll = async () => {
    setSavedPlayers([])
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('saved_players').delete().eq('user_id', user.id)
  }

  const isSaved = (slug: string) => savedPlayers.some(p => p.slug === slug)

  return { savedPlayers, savePlayer, removePlayer, isSaved, clearAll }
}
