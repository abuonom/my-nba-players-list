'use client'

import { useState, useEffect, useRef } from 'react'

export interface PlayerExtra { potential: string | null; age: number | null }

const globalCache = new Map<string, PlayerExtra>()
const CHUNK = 50

export function usePotentials(slugs: string[]): {
  data: Map<string, PlayerExtra>
  loading: boolean
  progress: { loaded: number; total: number }
} {
  const [data, setData] = useState<Map<string, PlayerExtra>>(new Map(globalCache))
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })
  const prevKey = useRef('')
  const abortRef = useRef(false)

  useEffect(() => {
    const missing = slugs.filter(s => !globalCache.has(s))
    const key = slugs.join(',')
    if (key === prevKey.current) return
    prevKey.current = key

    if (missing.length === 0) {
      setData(new Map(globalCache))
      return
    }

    abortRef.current = false
    setLoading(true)
    setProgress({ loaded: 0, total: missing.length })

    const chunks: string[][] = []
    for (let i = 0; i < missing.length; i += CHUNK) chunks.push(missing.slice(i, i + CHUNK))

    // Sequential: one browser at a time on the server
    let loaded = 0
    ;(async () => {
      for (const chunk of chunks) {
        if (abortRef.current) break
        try {
          const res = await fetch(`/api/players/potentials?slugs=${chunk.join(',')}`)
          const batch = await res.json()
          for (const [slug, val] of Object.entries(batch)) {
            globalCache.set(slug, val as PlayerExtra)
          }
        } catch {}
        loaded += chunk.length
        setProgress({ loaded, total: missing.length })
        setData(new Map(globalCache))
      }
      setLoading(false)
    })()

    return () => { abortRef.current = true }
  }, [slugs.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, progress }
}
