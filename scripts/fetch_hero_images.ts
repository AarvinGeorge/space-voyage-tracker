/**
 * fetch_hero_images.ts — build-time hero imagery.
 *
 * Searches Wikimedia Commons (public-domain / CC NASA-ESA-JAXA-CNSA-SpaceX
 * assets) for one iconic image per mission, optimizes to WebP (≤1600×900, q80)
 * with sharp, and writes public/missions/<slug>.webp. Throttled + retried to
 * respect Commons rate limits. Failures are non-fatal — the card falls back to a
 * clean monogram panel. Attribution lives in src/data/missions.ts.
 *
 * Run: npm run fetch:images   (add --force to refetch existing)
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'
import { MISSIONS } from '../src/data/missions'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../public/missions')
const UA = 'SpaceVoyageTracker/1.0 (build-time hero image fetch)'

// Search query per mission (top Commons file image is used).
const QUERY: Record<string, string> = {
  'apollo-11': 'Apollo 11 Aldrin Moon',
  'voyager-1': 'Voyager spacecraft',
  'voyager-2': 'Voyager 2 spacecraft',
  hubble: 'Hubble Space Telescope orbit',
  'mars-pathfinder': 'Mars Pathfinder Sojourner rover',
  cassini: 'Cassini Saturn spacecraft',
  iss: 'International Space Station orbit',
  'new-horizons': 'Pluto New Horizons true color',
  curiosity: 'Curiosity rover self portrait Mars',
  perseverance: 'Perseverance rover Mars selfie',
  jwst: 'James Webb Space Telescope first deep field',
  'artemis-2': 'Artemis II crew portrait',
  'sputnik-1': 'Sputnik 1 satellite',
  'vostok-1': 'Yuri Gagarin Vostok 1',
  rosetta: 'Comet 67P Churyumov Gerasimenko Rosetta',
  'hayabusa-2': 'Ryugu asteroid Hayabusa2',
  'chandrayaan-3': 'Chandrayaan-3 Vikram lander Moon',
  'tianwen-1': 'Zhurong rover Mars Tianwen',
  'change-6': "Chang'e 6 Moon",
  'falcon-1-flight-4': 'Falcon 1 rocket launch SpaceX',
  'falcon-heavy-starman': 'Starman Tesla Roadster space',
  'crew-dragon-demo-2': 'Crew Dragon Demo-2 launch',
  'starship-ift-3': 'SpaceX Starship integrated flight test launch',
  'new-shepard-ns15': 'Blue Origin New Shepard capsule',
  inspiration4: 'Inspiration4 crew Dragon',
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchRetry(url: string, tries = 4): Promise<Response | null> {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
    if (res.status === 429) {
      await sleep(2000 * (i + 1))
      continue
    }
    return res
  }
  return null
}

async function searchTopImage(query: string): Promise<string | null> {
  const api =
    'https://commons.wikimedia.org/w/api.php?format=json&origin=*' +
    '&action=query&generator=search&gsrnamespace=6&gsrlimit=5' +
    `&gsrsearch=${encodeURIComponent(query + ' filetype:bitmap')}` +
    '&prop=imageinfo&iiprop=url|mime&iiurlwidth=1600'
  const res = await fetchRetry(api)
  if (!res || !res.ok) return null
  const json: any = await res.json()
  const pages = json?.query?.pages
  if (!pages) return null
  const candidates = Object.values(pages) as any[]
  candidates.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  for (const p of candidates) {
    const ii = p.imageinfo?.[0]
    const mime: string = ii?.mime ?? ''
    if (ii && (mime.startsWith('image/jpeg') || mime.startsWith('image/png'))) {
      return ii.thumburl || ii.url
    }
  }
  return null
}

async function processMission(slug: string, query: string): Promise<boolean> {
  try {
    const imgUrl = await searchTopImage(query)
    if (!imgUrl) {
      console.log(`  ${slug.padEnd(22)} ✗ no search result`)
      return false
    }
    const res = await fetchRetry(imgUrl)
    if (!res || !res.ok) {
      console.log(`  ${slug.padEnd(22)} ✗ download ${res?.status ?? 'err'}`)
      return false
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const webp = await sharp(buf)
      .resize(1600, 900, { fit: 'cover', position: 'attention' })
      .webp({ quality: 80 })
      .toBuffer()
    writeFileSync(resolve(OUT_DIR, `${slug}.webp`), webp)
    console.log(`  ${slug.padEnd(22)} ✓ ${(webp.length / 1024).toFixed(0)} KB`)
    return true
  } catch (e) {
    console.log(`  ${slug.padEnd(22)} ✗ ${(e as Error).message}`)
    return false
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const force = process.env.FORCE === '1'
  let ok = 0
  console.log(`Fetching hero images → ${OUT_DIR}`)
  for (const m of MISSIONS) {
    if (existsSync(resolve(OUT_DIR, `${m.id}.webp`)) && !force) {
      console.log(`  ${m.id.padEnd(22)} skip (exists)`)
      ok++
      continue
    }
    if (await processMission(m.id, QUERY[m.id] ?? m.name)) ok++
    await sleep(1200) // throttle Commons
  }
  console.log(`\n✓ ${ok}/${MISSIONS.length} hero images present. Missing ones use the monogram fallback.`)
}

main()
