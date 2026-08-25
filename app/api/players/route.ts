import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://api.nba2kapi.com'
const API_KEY = process.env.NBA2K_API_KEY!

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const ALLOWED = ['teamType', 'team', 'minRating', 'maxRating', 'position']
  const params = new URLSearchParams()
  params.set('teamType', 'curr')

  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED.includes(key) && key !== 'teamType') params.set(key, value)
  }

  try {
    const res = await fetch(`${API_BASE}/api/players/bulk?${params.toString()}`, {
      headers: { 'X-API-Key': API_KEY },
      next: { revalidate: 300 },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch players' } }, { status: 500 })
  }
}
