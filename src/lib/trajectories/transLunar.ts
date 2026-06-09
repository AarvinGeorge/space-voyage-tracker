import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { EARTH_R, MOON_R, MOON_POS } from '@/lib/solarSystem'

// Cubic Bezier from low Earth orbit out to the Moon — a long arcing curve.
function transLunarArc(samples = 150): THREE.Vector3[] {
  const start = new THREE.Vector3(0, EARTH_R + 1.5, EARTH_R + 1.5)
  const end = MOON_POS.clone()
  // Control points bow the arc up-and-over (free-return character), tuned for the
  // compressed Earth-Moon distance (v1.2 H1).
  const c1 = new THREE.Vector3(EARTH_R * 2, EARTH_R * 3.4, -16)
  const c2 = new THREE.Vector3(MOON_POS.x - 8, MOON_POS.y + 16, MOON_POS.z + 16)
  const curve = new THREE.CubicBezierCurve3(start, c1, c2, end)
  return curve.getPoints(samples)
}

export function transLunar(_mission: Mission): THREE.Vector3[] {
  return transLunarArc(160)
}

// Trans-lunar arc + a short spiral descent onto the Moon's surface.
export function lunarLanding(_mission: Mission): THREE.Vector3[] {
  const arc = transLunarArc(130)
  const descent: THREE.Vector3[] = []
  const N = 28
  const approach = arc[arc.length - 1].clone()
  // Spiral from approach point down to a surface point on the Moon.
  const surface = MOON_POS.clone().add(new THREE.Vector3(0, -MOON_R, MOON_R * 0.4))
  for (let i = 1; i <= N; i++) {
    const t = i / N
    const ang = t * Math.PI * 2.2
    const radius = MOON_R * 1.8 * (1 - t)
    const base = approach.clone().lerp(surface, t)
    base.x += Math.cos(ang) * radius
    base.y += Math.sin(ang) * radius * 0.5
    descent.push(base)
  }
  return [...arc, ...descent]
}

// Tight circular orbit around the Moon.
export function lunarOrbit(_mission: Mission): THREE.Vector3[] {
  const arc = transLunarArc(110)
  const orbit: THREE.Vector3[] = []
  const N = 60
  const r = MOON_R * 2.2
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2
    orbit.push(MOON_POS.clone().add(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.4, Math.sin(a) * r)))
  }
  return [...arc, ...orbit]
}
