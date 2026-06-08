import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { helioPos, smoothCurve } from '@/lib/solarSystem'
import { planetAnchors } from './gravityAssistOuter'

// Outbound through any gravity-assist planets, then a long straight radial line
// into deep space (Voyager 1, New Horizons).
export function interstellar(mission: Mission): THREE.Vector3[] {
  const keys = mission.flybyPlanets ?? ['JUPITER']
  const anchors = planetAnchors(keys.includes('EARTH') ? keys : ['EARTH', ...keys])
  // Continue straight out past the last anchor, far into deep space.
  const last = anchors[anchors.length - 1]
  const prev = anchors[anchors.length - 2] ?? helioPos('EARTH')
  const dir = last.clone().sub(prev).normalize()
  anchors.push(last.clone().add(dir.clone().multiplyScalar(35)))
  anchors.push(last.clone().add(dir.clone().multiplyScalar(85)))
  return smoothCurve(anchors, 180)
}
