import { NextRequest, NextResponse } from 'next/server'
import { readCache } from '@/lib/fileCache'
import { ContractEntry } from '@/app/api/contracts/route'

function norm(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const cached = readCache<ContractEntry[]>('contracts')
  if (!cached) return NextResponse.json({ success: false, data: null })

  // slug → "nikola-jokic" → try to match "Nikola Jokić"
  const slugNorm = norm(slug.replace(/-/g, ' '))

  const match = cached.data.find(c => {
    const nameNorm = norm(c.name)
    return nameNorm === slugNorm || nameNorm.includes(slugNorm) || slugNorm.includes(nameNorm)
  })

  return NextResponse.json({ success: true, data: match ?? null })
}
