/**
 * fetch_trajectories.ts — build-time trajectory baking + status resolution.
 *
 * For each mission, computes the trajectory waypoints (the SAME archetype
 * generators the renderer uses) and writes them to
 * src/data/missions/trajectories/<slug>.json as [{ t, position:[x,y,z] }].
 * Committing these JSON files makes "ALL STORED AT BUILD TIME · ZERO RUNTIME
 * API CALLS" literally true — the renderer prefers the committed JSON.
 *
 * Status resolution (PRD F2.0): optionally probes JPL HORIZONS for each mission
 * with a NAIF body code to set `livelyTracked`, then logs resolveStatus(). Set
 * HORIZONS_PROBE=1 to enable the (slow, network) probe; otherwise livelyTracked
 * stays false (all completed missions resolve to SUCCESS / PARTIAL — correct).
 *
 * Run: npm run fetch:trajectories   (or  HORIZONS_PROBE=1 npm run fetch:trajectories)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import * as THREE from 'three'
import { MISSIONS } from '../src/data/missions'
import type { Mission } from '../src/data/types'
import { resolveStatus } from '../src/lib/resolveStatus'
import { missionCurve } from '../src/data/missionCurve'
import { leoCircular } from '../src/lib/trajectories/leoCircular'
import { transLunar, lunarLanding, lunarOrbit } from '../src/lib/trajectories/transLunar'
import { hohmannMars, hohmannVenus } from '../src/lib/trajectories/hohmannMars'
import { gravityAssistOuter } from '../src/lib/trajectories/gravityAssistOuter'
import { hyperbolicEscape } from '../src/lib/trajectories/hyperbolicEscape'
import { interstellar } from '../src/lib/trajectories/interstellar'
import { ballisticSuborbital } from '../src/lib/trajectories/ballisticSuborbital'
import { l2Halo } from '../src/lib/trajectories/l2Halo'
import { cometRendezvous } from '../src/lib/trajectories/cometRendezvous'
import { asteroidRendezvous } from '../src/lib/trajectories/asteroidRendezvous'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../src/data/missions/trajectories')

function pointsFor(m: Mission): THREE.Vector3[] {
  switch (m.trajectoryArchetype) {
    case 'NASA_OEM_FILE':
      return missionCurve.getPoints(400)
    case 'LEO_CIRCULAR':
      return leoCircular(m)
    case 'TRANS_LUNAR':
      return transLunar(m)
    case 'LUNAR_ORBIT':
      return lunarOrbit(m)
    case 'LUNAR_LANDING':
      return lunarLanding(m)
    case 'HOHMANN_MARS':
      return hohmannMars(m)
    case 'HOHMANN_VENUS':
      return hohmannVenus(m)
    case 'GRAVITY_ASSIST_OUTER':
      return gravityAssistOuter(m)
    case 'HYPERBOLIC_ESCAPE':
      return hyperbolicEscape(m)
    case 'INTERSTELLAR':
      return interstellar(m)
    case 'BALLISTIC_SUBORBITAL':
      return ballisticSuborbital(m)
    case 'L2_HALO':
      return l2Halo(m)
    case 'COMET_RENDEZVOUS':
      return cometRendezvous(m)
    case 'ASTEROID_RENDEZVOUS':
      return asteroidRendezvous(m)
  }
}

async function probeHorizons(code: string): Promise<boolean> {
  // Best-effort liveness check: does HORIZONS return current state vectors?
  const now = new Date()
  const start = now.toISOString().slice(0, 10)
  const stop = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10)
  const url =
    `https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='${code}'` +
    `&EPHEM_TYPE=VECTORS&CENTER='500@399'&START_TIME='${start}'&STOP_TIME='${stop}'&STEP_SIZE='1d'`
  try {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(to)
    const text = await res.text()
    return text.includes('$$SOE') && text.includes('$$EOE') && !/No ephemeris|Cannot interpret/i.test(text)
  } catch {
    return false
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const probe = process.env.HORIZONS_PROBE === '1'
  console.log(`Baking ${MISSIONS.length} trajectories → ${OUT_DIR}`)

  for (const m of MISSIONS) {
    const pts = pointsFor(m)
    const N = pts.length
    const waypoints = pts.map((p, i) => ({
      t: N === 1 ? 0 : i / (N - 1),
      position: [round(p.x), round(p.y), round(p.z)] as [number, number, number],
    }))
    writeFileSync(resolve(OUT_DIR, `${m.id}.json`), JSON.stringify(waypoints))

    let lively = m.livelyTracked
    if (probe && m.horizonsBodyCode) {
      lively = await probeHorizons(m.horizonsBodyCode)
    }
    const status = resolveStatus({ ...m, livelyTracked: lively })
    console.log(`  ${m.id.padEnd(22)} ${String(N).padStart(4)} pts  ${status}${probe && lively ? '  (HORIZONS live)' : ''}`)
  }
  console.log('✓ trajectory JSON written. Commit src/data/missions/trajectories/.')
}

function round(n: number) {
  return Math.round(n * 1000) / 1000
}

main()
