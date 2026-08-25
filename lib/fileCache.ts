import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.cache')

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
}

export function readCache<T>(key: string): { data: T; ts: number } | null {
  try {
    const file = path.join(CACHE_DIR, `${key}.json`)
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T) {
  try {
    ensureCacheDir()
    const file = path.join(CACHE_DIR, `${key}.json`)
    fs.writeFileSync(file, JSON.stringify({ data, ts: Date.now() }), 'utf-8')
  } catch {}
}

export function isFresh(ts: number, ttlMs: number) {
  return Date.now() - ts < ttlMs
}
