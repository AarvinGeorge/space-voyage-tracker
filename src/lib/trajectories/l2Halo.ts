import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { EARTH_R, L2_POS } from '@/lib/solarSystem'

// Outbound transfer from Earth to the Sun-Earth L2 point, then a halo loop
// around it (James Webb).
export function l2Halo(_mission: Mission): THREE.Vector3[] {
  const start = new THREE.Vector3(0, EARTH_R + 1.0, EARTH_R + 1.0)
  const outbound: THREE.Vector3[] = []
  const M = 60
  // Gentle bowed transfer toward L2.
  const ctrl = start.clone().lerp(L2_POS, 0.5).add(new THREE.Vector3(0, 14, 8))
  const curve = new THREE.QuadraticBezierCurve3(start, ctrl, L2_POS.clone())
  for (let i = 0; i <= M; i++) outbound.push(curve.getPoint(i / M))

  // Halo loop around L2, in a plane roughly perpendicular to the Earth-L2 line.
  const axis = L2_POS.clone().normalize()
  const u = new THREE.Vector3(0, 1, 0).cross(axis).normalize()
  const v = axis.clone().cross(u).normalize()
  const halo: THREE.Vector3[] = []
  const N = 80
  const rA = 11
  const rB = 7
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2
    halo.push(L2_POS.clone().addScaledVector(u, Math.cos(a) * rA).addScaledVector(v, Math.sin(a) * rB))
  }
  return [...outbound, ...halo]
}
