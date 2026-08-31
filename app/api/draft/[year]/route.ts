import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params
  const draftYear = parseInt(year, 10)

  if (isNaN(draftYear)) {
    return NextResponse.json({ success: false, error: 'Anno non valido', data: [] }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('draft_picks')
    .select('slug, rank, pick, name, positions, height, team_abbr, overall')
    .eq('draft_year', draftYear)
    .order('rank', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 })
  }

  const players = (data ?? []).map(row => ({
    rank:      row.rank,
    pick:      row.pick,
    name:      row.name,
    slug:      row.slug,
    positions: row.positions,
    height:    row.height,
    teamAbbr:  row.team_abbr,
    overall:   row.overall,
  }))

  return NextResponse.json({ success: true, data: players }, {
    headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800' },
  })
}
