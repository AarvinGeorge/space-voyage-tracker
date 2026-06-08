import * as THREE from 'three'
import type { Mission, TrajectoryType } from '@/data/types'
import { missionCurve } from '@/data/missionCurve'
import { leoCircular } from './leoCircular'
import { transLunar, lunarLanding, lunarOrbit } from './transLunar'
import { hohmannMars, hohmannVenus } from './hohmannMars'
import { gravityAssistOuter } from './gravityAssistOuter'
import { hyperbolicEscape } from './hyperbolicEscape'
import { interstellar } from './interstellar'
import { ballisticSuborbital } from './ballisticSuborbital'
import { l2Halo } from './l2Halo'
import { cometRendezvous } from './cometRendezvous'
import { asteroidRendezvous } from './asteroidRendezvous'

type Generator = (m: Mission) => THREE.Vector3[]

const GENERATORS: Record<Exclude<TrajectoryType, 'NASA_OEM_FILE'>, Generator> = {
  LEO_CIRCULAR: leoCircular,
  TRANS_LUNAR: transLunar,
  LUNAR_ORBIT: lunarOrbit,
  LUNAR_LANDING: lunarLanding,
  HOHMANN_MARS: hohmannMars,
  HOHMANN_VENUS: hohmannVenus,
  GRAVITY_ASSIST_OUTER: gravityAssistOuter,
  HYPERBOLIC_ESCAPE: hyperbolicEscape,
  INTERSTELLAR: interstellar,
  BALLISTIC_SUBORBITAL: ballisticSuborbital,
  L2_HALO: l2Halo,
  COMET_RENDEZVOUS: cometRendezvous,
  ASTEROID_RENDEZVOUS: asteroidRendezvous,
}

// Precomputed, build-time trajectory JSON (committed). Preferred when present
// so the page makes zero runtime API calls (footer disclosure).
type Waypoint = { t: number; position: [number, number, number]; timestamp?: string }
const jsonModules = import.meta.glob('../../data/missions/trajectories/*.json', {
  eager: true,
}) as Record<string, { default: Waypoint[] }>

const jsonBySlug: Record<string, THREE.Vector3[]> = {}
for (const [path, mod] of Object.entries(jsonModules)) {
  const slug = path.split('/').pop()?.replace(/\.json$/, '')
  const data = mod.default
  if (slug && Array.isArray(data) && data.length >= 2) {
    jsonBySlug[slug] = data.map((w) => new THREE.Vector3(w.position[0], w.position[1], w.position[2]))
  }
}

const cache = new Map<string, THREE.Vector3[]>()

// Compute the archetype path for a mission (no JSON). Artemis defers to the
// existing v0 missionCurve.
export function computeTrajectoryPoints(mission: Mission): THREE.Vector3[] {
  if (mission.trajectoryArchetype === 'NASA_OEM_FILE') {
    return missionCurve.getPoints(400)
  }
  return GENERATORS[mission.trajectoryArchetype](mission)
}

// Trajectory points for a mission: committed JSON if present, else computed.
export function getTrajectoryPoints(mission: Mission): THREE.Vector3[] {
  const cached = cache.get(mission.id)
  if (cached) return cached
  const pts = jsonBySlug[mission.id] ?? computeTrajectoryPoints(mission)
  cache.set(mission.id, pts)
  return pts
}

// A smooth curve through the points, for sampling positions at normalized t.
export function getTrajectoryCurve(mission: Mission): THREE.CatmullRomCurve3 {
  if (mission.trajectoryArchetype === 'NASA_OEM_FILE') return missionCurve
  return new THREE.CatmullRomCurve3(getTrajectoryPoints(mission), false, 'catmullrom', 0.5)
}
