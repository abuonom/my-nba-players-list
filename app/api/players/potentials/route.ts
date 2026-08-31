import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.get('slugs')?.split(',').filter(Boolean) ?? []
  if (slugs.length === 0) return NextResponse.json({})

  const { data, error } = await supabase
    .from('player_potentials')
    .select('slug, potential, age')
    .in('slug', slugs)

  if (error) {
    return NextResponse.json({})
  }

  const result: Record<string, { potential: string | null; age: number | null }> = {}
  for (const row of data) result[row.slug] = { potential: row.potential, age: row.age }
  // Riempi i missing con null
  for (const slug of slugs) if (!result[slug]) result[slug] = { potential: null, age: null }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' },
  })
}
