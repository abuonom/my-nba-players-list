import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('players')
    .select('data')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: { message: 'Player not found' } }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: data.data })
}
