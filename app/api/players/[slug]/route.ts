import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://api.nba2kapi.com'
const API_KEY = process.env.NBA2K_API_KEY!

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const res = await fetch(`${API_BASE}/api/players/slug/${slug}?teamType=curr`, {
      headers: { 'X-API-Key': API_KEY },
      next: { revalidate: 300 },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Failed to fetch player' } }, { status: 500 })
  }
}
