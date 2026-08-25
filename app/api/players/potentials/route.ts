import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'
import { readCache, writeCache, isFresh } from '@/lib/fileCache'

const TTL = 1000 * 60 * 60 * 6 // 6h
const CONCURRENCY = 6

interface PotentialData { potential: string | null; age: number | null }

function extractFromHtml(html: string): PotentialData {
  const ldMatches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  let potential: string | null = null
  let birthdate: string | null = null

  for (const match of ldMatches) {
    try {
      const json = JSON.parse(match[1])
      // Flatten: handle @graph wrapper, plain array, or single object
      const top = Array.isArray(json) ? json : (json['@graph'] ? json['@graph'] : [json])
      for (const item of top) {
        const props: { name?: string; propertyID?: string; value?: string }[] = item.additionalProperty ?? []
        for (const prop of props) {
          if (prop.name === 'Potential Attribute') potential = prop.value ?? null
          if (prop.name === 'Birthday' || prop.propertyID === 'birthDate') birthdate = prop.value ?? null
        }
        if (item['@type'] === 'Person' && item.birthDate) birthdate = item.birthDate
      }
    } catch {}
  }

  let age: number | null = null
  if (birthdate) {
    const birth = new Date(birthdate)
    const now = new Date()
    age = now.getFullYear() - birth.getFullYear()
    if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--
  }

  return { potential, age }
}

export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.get('slugs')?.split(',').filter(Boolean) ?? []
  if (slugs.length === 0) return NextResponse.json({})

  // Split into cached and missing
  const result: Record<string, PotentialData> = {}
  const missing: string[] = []

  for (const slug of slugs) {
    const cached = readCache<PotentialData>(`potential_${slug}`)
    if (cached && isFresh(cached.ts, TTL)) {
      result[slug] = cached.data
    } else {
      missing.push(slug)
    }
  }

  if (missing.length === 0) return NextResponse.json(result)

  // Scrape missing slugs with one shared browser, CONCURRENCY pages at a time
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    })
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    })

    // Process in chunks of CONCURRENCY
    for (let i = 0; i < missing.length; i += CONCURRENCY) {
      const chunk = missing.slice(i, i + CONCURRENCY)
      await Promise.all(chunk.map(async slug => {
        const page = await context.newPage()
        try {
          await page.goto(`https://www.2kratings.com/${slug}`, {
            waitUntil: 'domcontentloaded',
            timeout: 20000,
          })
          const html = await page.content()
          const data = extractFromHtml(html)
          writeCache(`potential_${slug}`, data)
          result[slug] = data
        } catch {
          result[slug] = { potential: null, age: null }
        } finally {
          await page.close()
        }
      }))
    }
  } catch (e) {
    console.error('Bulk potential scraping error:', e)
    // Return whatever we have so far
    for (const slug of missing) {
      if (!result[slug]) result[slug] = { potential: null, age: null }
    }
  } finally {
    if (browser) await browser.close()
  }

  return NextResponse.json(result)
}
