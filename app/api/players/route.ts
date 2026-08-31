import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get('position')
  const team = searchParams.get('team')
  const minRating = searchParams.get('minRating')
  const maxRating = searchParams.get('maxRating')

  try {
    const { data, error } = await supabase.from('players').select('data')
    if (error) throw error

    let players = data.map((row: { data: Record<string, unknown> }) => row.data)

    if (position) players = players.filter((p: Record<string, unknown>) => Array.isArray(p.positions) && (p.positions as string[]).includes(position))
    if (team) players = players.filter((p: Record<string, unknown>) => p.team === team)
    if (minRating) players = players.filter((p: Record<string, unknown>) => Number(p.overall) >= Number(minRating))
    if (maxRating) players = players.filter((p: Record<string, unknown>) => Number(p.overall) <= Number(maxRating))

    return NextResponse.json({ success: true, data: players }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore DB'
    return NextResponse.json({ success: false, error: { message: msg } }, { status: 500 })
  }
}
