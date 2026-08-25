import { NextRequest, NextResponse } from 'next/server'
import { launchStealth } from '@/lib/browser'
import { readCache, writeCache, isFresh } from '@/lib/fileCache'

interface DraftPlayer {
  rank: number
  pick: string
  name: string
  slug: string
  positions: string[]
  height: string
  teamAbbr: string
  overall: number
}

const TTL = 1000 * 60 * 60 * 24 // 24h

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params
  const cacheKey = `draft_${year}`

  const cached = readCache<DraftPlayer[]>(cacheKey)
  if (cached && isFresh(cached.ts, TTL)) {
    return NextResponse.json({ success: true, data: cached.data })
  }

  let browser
  try {
    const { browser: b, context } = await launchStealth()
    browser = b
    const page = await context.newPage()
    await page.goto(`https://www.2kratings.com/lists/${year}-nba-draft-class`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await page.waitForTimeout(1500)

    const players: DraftPlayer[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('table tbody tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
        if (cells.length < 5) return null

        const rank = parseInt(cells[0].getAttribute('data-sort') ?? '0', 10)

        const nameEl = cells[1].querySelector('.player-name')
        const name = nameEl?.textContent?.trim() ?? ''
        const href = cells[1].querySelector('a[href*="2kratings.com/"]')?.getAttribute('href') ?? ''
        const slug = href.split('/').filter(Boolean).pop() ?? ''

        const subtext = cells[1].querySelector('.entry-subtext-font')?.textContent?.trim() ?? ''
        const parts = subtext.split('|').map((s: string) => s.trim())
        const positions = parts[0]?.split('/').map((s: string) => s.trim().toUpperCase()).filter(Boolean) ?? []
        const height = parts[1] ?? ''

        const pick = cells[2]?.textContent?.trim() ?? ''
        const overall = parseInt(cells[4]?.getAttribute('data-sort') ?? '0', 10)
        const teamAbbr = cells[3]?.textContent?.trim() ?? ''

        return { rank, pick, name, slug, positions, height, teamAbbr, overall }
      }).filter((p: DraftPlayer | null): p is DraftPlayer => p !== null && p.name !== '' && p.overall > 0)
    })

    writeCache(cacheKey, players)
    return NextResponse.json({ success: true, data: players })
  } catch (e) {
    console.error('Draft scraping error:', e)
    if (cached) return NextResponse.json({ success: true, data: cached.data, stale: true })
    return NextResponse.json({ success: false, error: 'Scraping failed', data: [] }, { status: 500 })
  } finally {
    if (browser) await browser.close()
  }
}
