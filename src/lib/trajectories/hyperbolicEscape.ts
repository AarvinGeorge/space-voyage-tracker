import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { helioPos, helioRadius, smoothCurve } from '@/lib/solarSystem'

// Hyperbolic departure from Earth crossing the Mars orbit and continuing
// outward into a heliocentric, Mars-crossing orbit (e.g. Falcon Heavy / Starman).
export function hyperbolicEscape(_mission: Mission): THREE.Vector3[] {
  const earth = helioPos('EARTH')
  const startAng = Math.atan2(earth.z, earth.x)
  const anchors: THREE.Vector3[] = [earth.clone()]
  const sweep = Math.PI * 0.9
  const steps = 4
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const ang = startAng + sweep * t
    const r = helioRadius(1 + t * 0.7) // climbs from Earth's orbit past Mars
    anchors.push(new THREE.Vector3(Math.cos(ang) * r, t * 2.0, Math.sin(ang) * r))
  }
  return smoothCurve(anchors, 150)
}
