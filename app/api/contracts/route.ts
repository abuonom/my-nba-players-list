import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ContractEntry {
  name: string
  team: string
  salaries: { year: string; amount: number; note: string }[]
  years_remaining: number
}

export async function GET() {
  const { data, error } = await supabase
    .from('contracts')
    .select('name, team, salaries, years_remaining')

  if (error) {
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
