import { notFound } from 'next/navigation'
import { Player } from '@/types/nba'
import PlayerDetailClient from './PlayerDetailClient'

async function getPlayer(slug: string): Promise<Player | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/players/${slug}`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()
    if (!data.success) return null
    return data.data
  } catch {
    return null
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const player = await getPlayer(slug)

  if (!player) notFound()

  return <PlayerDetailClient player={player} />
}
