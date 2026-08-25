import { NextResponse } from 'next/server'
import { chromium } from 'playwright'
import { readCache, writeCache, isFresh } from '@/lib/fileCache'

export interface ContractEntry {
  name: string
  team: string
  salaries: { year: string; amount: number; note: string }[]
  yearsRemaining: number
}

const TTL = 1000 * 60 * 60 * 24 // 24h
const CACHE_KEY = 'contracts'

export async function GET() {
  const cached = readCache<ContractEntry[]>(CACHE_KEY)
  if (cached && isFresh(cached.ts, TTL)) {
    return NextResponse.json({ success: true, data: cached.data, cached: true })
  }

  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage'],
    })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    })
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    })
    const page = await context.newPage()

    await page.goto('https://www.basketball-reference.com/contracts/players.html', {
      waitUntil: 'load',
      timeout: 30000,
    })
    await page.waitForSelector('#player-contracts', { timeout: 15000 })

    const data: ContractEntry[] = await page.evaluate(() => {
      const table = document.querySelector('#player-contracts')
      if (!table) return []

      const headerCells = Array.from(table.querySelectorAll('thead tr:last-child th'))
      const yearHeaders = headerCells.slice(3).map(th => th.textContent?.trim() ?? '').filter(h => h.includes('-'))

      const rows = Array.from(table.querySelectorAll('tbody tr')).filter(r => !r.classList.contains('thead'))

      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td, th'))
        if (cells.length < 4) return null

        const name = cells[1]?.textContent?.trim() ?? ''
        const team = cells[2]?.textContent?.trim() ?? ''
        if (!name) return null

        const salaries = yearHeaders.map((year, i) => {
          const cell = cells[3 + i]
          const text = cell?.textContent?.trim() ?? ''
          const match = text.match(/\$([\d,]+)/)
          if (!match) return null
          const cls = cell?.className ?? ''
          const note = cls.includes('salary-pl') ? 'PO' : cls.includes('salary-tm') ? 'TO' : ''
          return { year, amount: parseInt(match[1].replace(/,/g, ''), 10), note }
        }).filter((s): s is { year: string; amount: number; note: string } => s !== null)

        if (salaries.length === 0) return null
        return { name, team, salaries, yearsRemaining: salaries.length }
      }).filter((e): e is ContractEntry => e !== null)
    })

    await browser.close()
    browser = undefined

    writeCache(CACHE_KEY, data)
    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('Contracts scraping error:', e)
    if (browser) { try { await browser.close() } catch {} }
    if (cached) return NextResponse.json({ success: true, data: cached.data, stale: true })
    return NextResponse.json({ success: false, data: [], error: String(e) }, { status: 500 })
  }
}
