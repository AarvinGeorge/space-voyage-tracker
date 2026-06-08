import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { ENDPOINT_POS, helioPos, smoothCurve } from '@/lib/solarSystem'
import { planetAnchors } from './gravityAssistOuter'

// Multi-slingshot heliocentric trajectory ending in rendezvous with comet 67P
// (Rosetta + Philae).
export function cometRendezvous(mission: Mission): THREE.Vector3[] {
  const keys = mission.flybyPlanets ?? ['EARTH', 'MARS', 'EARTH']
  const anchors = planetAnchors(keys.includes('EARTH') ? keys : ['EARTH', ...keys])
  const comet = ENDPOINT_POS.COMET_67P.clone()
  // Loop outward toward the comet via an intermediate apoapsis.
  const apex = helioPos('MARS').clone().lerp(comet, 0.6).add(new THREE.Vector3(0, 4, 0))
  anchors.push(apex, comet)
  return smoothCurve(anchors, 190)
}
