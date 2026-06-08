import * as THREE from 'three'
import type { Mission, PlanetKey } from '@/data/types'
import { helioPos, smoothCurve } from '@/lib/solarSystem'

// Build anchors from a planet sequence, perturbing repeats so the Catmull-Rom
// curve never sees a zero-length segment.
export function planetAnchors(keys: PlanetKey[]): THREE.Vector3[] {
  const out: THREE.Vector3[] = []
  const seen = new Map<PlanetKey, number>()
  for (const k of keys) {
    const n = seen.get(k) ?? 0
    seen.set(k, n + 1)
    const p = helioPos(k).clone()
    if (n > 0) {
      // Nudge a repeated flyby slightly so anchors stay distinct.
      p.add(new THREE.Vector3((n % 2 ? 1 : -1) * 3.5, n * 1.6, n * 2.4))
    }
    out.push(p)
  }
  return out
}

// Snaking multi-segment curve through a sequence of outer planets.
export function gravityAssistOuter(mission: Mission): THREE.Vector3[] {
  const keys = mission.flybyPlanets ?? ['EARTH', 'JUPITER', 'SATURN']
  const anchors = planetAnchors(keys.includes('EARTH') ? keys : ['EARTH', ...keys])
  // Extend slightly past the final body so the path doesn't stop dead on it.
  if (anchors.length >= 2) {
    const last = anchors[anchors.length - 1]
    const prev = anchors[anchors.length - 2]
    anchors.push(last.clone().add(last.clone().sub(prev).normalize().multiplyScalar(8)))
  }
  return smoothCurve(anchors, 180)
}
