import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { EARTH_R } from '@/lib/solarSystem'

// Circular Low Earth Orbit around Earth (at origin), exaggerated to read at the
// v0 1-unit-=-1000-km scale. Inclination derived deterministically from the slug
// so different LEO missions get visibly different orbit planes.
export function leoCircular(mission: Mission): THREE.Vector3[] {
  const altByMission: Record<string, number> = {
    hubble: 3.4,
    iss: 2.6,
    'sputnik-1': 2.0,
    inspiration4: 4.1,
    'falcon-1-flight-4': 2.3,
    'crew-dragon-demo-2': 2.8,
    'vostok-1': 2.1,
  }
  const r = EARTH_R + (altByMission[mission.id] ?? 3.0)

  // Deterministic inclination from the slug.
  let h = 0
  for (let i = 0; i < mission.id.length; i++) h = (h * 31 + mission.id.charCodeAt(i)) % 360
  const incl = ((25 + (h % 50)) * Math.PI) / 180
  const node = ((h * 7) % 360) * (Math.PI / 180)

  const pts: THREE.Vector3[] = []
  const N = 128
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    // Tilt the orbit plane by inclination about the node axis.
    const v = new THREE.Vector3(x, 0, z)
    v.applyAxisAngle(new THREE.Vector3(Math.cos(node), 0, Math.sin(node)), incl)
    pts.push(v)
  }
  return pts
}
