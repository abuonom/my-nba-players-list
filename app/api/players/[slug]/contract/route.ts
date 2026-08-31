import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ContractEntry } from '@/app/api/contracts/route'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function norm(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const slugNorm = norm(slug.replace(/-/g, ' '))

  const { data, error } = await supabase
    .from('contracts')
    .select('name, team, salaries, years_remaining')

  if (error) return NextResponse.json({ success: false, data: null })

  const contracts = data as ContractEntry[]
  const match = contracts.find(c => {
    const nameNorm = norm(c.name)
    return nameNorm === slugNorm || nameNorm.includes(slugNorm) || slugNorm.includes(nameNorm)
  })

  return NextResponse.json({ success: true, data: match ?? null }, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  })
}
