import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { EARTH_R, KARMAN_R } from '@/lib/solarSystem'

// Parabolic up-and-down arc rising above the Kármán line (suborbital hops:
// New Shepard, Starship IFT-3). A short, tight arc hugging the Earth.
export function ballisticSuborbital(mission: Mission): THREE.Vector3[] {
  const apogee = mission.id === 'starship-ift-3' ? KARMAN_R + 5.0 : KARMAN_R + 1.6
  const spread = 2.4 // lateral travel
  const pts: THREE.Vector3[] = []
  const N = 100
  // Launch point on the surface, arc rises along +Y, lands a short distance away.
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = (t - 0.5) * spread * 2
    // Parabola: 0 at ends, 1 at apex.
    const h = 1 - (2 * t - 1) * (2 * t - 1)
    const y = EARTH_R + (apogee - EARTH_R) * h
    pts.push(new THREE.Vector3(x, y, EARTH_R * 0.2))
  }
  return pts
}
