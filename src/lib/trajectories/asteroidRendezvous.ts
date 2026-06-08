import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { ENDPOINT_POS, helioPos, smoothCurve } from '@/lib/solarSystem'

// Outbound transfer to a near-Earth asteroid + a return half-loop back toward
// Earth (Hayabusa 2 sample return to Ryugu).
export function asteroidRendezvous(_mission: Mission): THREE.Vector3[] {
  const earth = helioPos('EARTH')
  const ryugu = ENDPOINT_POS.RYUGU.clone()
  // Outbound apoapsis pushes the loop out past the asteroid.
  const out = earth.clone().lerp(ryugu, 0.55).add(new THREE.Vector3(2, 3, -2))
  // Return point: Earth's position nudged so the loop closes visibly distinct.
  const back = earth.clone().add(new THREE.Vector3(-2.5, -1.5, 3.0))
  return smoothCurve([earth, out, ryugu, back], 170)
}
