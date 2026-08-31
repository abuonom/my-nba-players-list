import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Player } from '@/types/nba'
import PlayerDetailClient from './PlayerDetailClient'

async function getPlayer(slug: string): Promise<Player | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('players')
    .select('data')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return data.data as Player
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const player = await getPlayer(slug)

  if (!player) notFound()

  return <PlayerDetailClient player={player} />
}
