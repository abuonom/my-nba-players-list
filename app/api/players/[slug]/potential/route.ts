import { NextRequest, NextResponse } from 'next/server'
import { launchStealth } from '@/lib/browser'
import { readCache, writeCache, isFresh } from '@/lib/fileCache'

const TTL = 1000 * 60 * 60 * 6 // 6h

interface PotentialData { potential: string | null; age: number | null }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cacheKey = `potential_${slug}`

  const cached = readCache<PotentialData>(cacheKey)
  if (cached && isFresh(cached.ts, TTL)) {
    return NextResponse.json({ success: true, ...cached.data, cached: true })
  }

  let browser
  try {
    const { browser: b, context } = await launchStealth()
    browser = b
    const page = await context.newPage()
    await page.goto(`https://www.2kratings.com/${slug}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const result = await page.evaluate(() => {
      let potential: string | null = null
      let birthdate: string | null = null

      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent ?? '')
          const top = Array.isArray(json) ? json : (json['@graph'] ? json['@graph'] : [json])
          for (const item of top) {
            const props = item.additionalProperty ?? []
            for (const prop of props) {
              if (prop.name === 'Potential Attribute') potential = prop.value
              if (prop.name === 'Birthday' || prop.propertyID === 'birthDate') birthdate = prop.value
            }
            if (item['@type'] === 'Person' && item.birthDate) birthdate = item.birthDate
          }
        } catch {}
      }
      return { potential, birthdate }
    })

    let age: number | null = null
    if (result.birthdate) {
      const birth = new Date(result.birthdate)
      const now = new Date()
      age = now.getFullYear() - birth.getFullYear()
      if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--
    }

    const data: PotentialData = { potential: result.potential, age }
    writeCache(cacheKey, data)
    return NextResponse.json({ success: true, ...data })
  } catch (e) {
    console.error('Potential scraping error:', e)
    if (cached) return NextResponse.json({ success: true, ...cached.data, stale: true })
    return NextResponse.json({ success: true, potential: null, age: null })
  } finally {
    if (browser) await browser.close()
  }
}
