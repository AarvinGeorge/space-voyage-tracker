import * as THREE from 'three'
import type { PlanetKey, EndpointBody } from '@/data/types'

// ─────────────────────────────────────────────────────────────────────────
// Shared solar-system geometry — single source of truth for body positions,
// radii, colours, consumed by BOTH the SolarSystem renderer and the
// trajectory archetype generators (so a trajectory always ends where its
// destination body is actually drawn).
//
// Two coordinate frames, each centred on the scene origin:
//   • EARTH_SYSTEM — Earth at origin (inherits v0 scale: 1 unit ≈ 1000 km).
//   • HELIOCENTRIC — Sun at origin, planets on a log-compressed radial layout.
// The active view mode decides which frame's bodies are visible.
// ─────────────────────────────────────────────────────────────────────────

// ── EARTH_SYSTEM (v0-compatible scale) ──
export const EARTH_R = 6.371
export const MOON_R = 1.737
export const KARMAN_R = EARTH_R + 0.12 // ~100 km above the surface, exaggerated to read
// Generic Moon position for non-Artemis lunar missions (Artemis uses its OEM
// Moon). Compressed from the true ~384 units so Earth + arc frame together.
export const MOON_POS = new THREE.Vector3(26, 18, -150)
// Sun direction for the earth-system view (matches v0 SUN_POS direction).
export const SUN_DIR_EARTH = new THREE.Vector3(3000, 600, -1000).normalize()
// Sun-Earth L2 marker: anti-sun side of Earth, compressed to a readable distance.
export const L2_POS = SUN_DIR_EARTH.clone().multiplyScalar(-46)

// ── HELIOCENTRIC (log-compressed) ──
export type PlanetDef = {
  key: PlanetKey
  name: string
  au: number
  angleDeg: number
  radius: number
  color: string
}

// Scene radius from astronomical units — log compression keeps Neptune on screen
// while the inner planets stay outside the Sun.
export function helioRadius(au: number): number {
  return 10 + 30 * Math.log10(1 + au)
}

export const SUN_R = 7

export const PLANETS: Record<PlanetKey, PlanetDef> = {
  MERCURY: { key: 'MERCURY', name: 'Mercury', au: 0.39, angleDeg: 35, radius: 0.8, color: '#9c8a7a' },
  VENUS: { key: 'VENUS', name: 'Venus', au: 0.72, angleDeg: 80, radius: 1.2, color: '#d9b27c' },
  EARTH: { key: 'EARTH', name: 'Earth', au: 1.0, angleDeg: 130, radius: 1.35, color: '#2a6fdb' },
  MARS: { key: 'MARS', name: 'Mars', au: 1.52, angleDeg: 168, radius: 1.05, color: '#c1440e' },
  JUPITER: { key: 'JUPITER', name: 'Jupiter', au: 5.2, angleDeg: 232, radius: 3.2, color: '#d8a878' },
  SATURN: { key: 'SATURN', name: 'Saturn', au: 9.54, angleDeg: 290, radius: 2.8, color: '#e3c98f' },
  URANUS: { key: 'URANUS', name: 'Uranus', au: 19.2, angleDeg: 330, radius: 2.0, color: '#9fd8e0' },
  NEPTUNE: { key: 'NEPTUNE', name: 'Neptune', au: 30.1, angleDeg: 18, radius: 1.9, color: '#3b6fd6' },
  PLUTO: { key: 'PLUTO', name: 'Pluto', au: 39.5, angleDeg: 205, radius: 0.6, color: '#b9a08a' },
}

export const PLANET_KEYS: PlanetKey[] = [
  'MERCURY',
  'VENUS',
  'EARTH',
  'MARS',
  'JUPITER',
  'SATURN',
  'URANUS',
  'NEPTUNE',
  'PLUTO',
]

// Heliocentric position of a planet, in the ecliptic (XZ) plane.
export function helioPos(key: PlanetKey): THREE.Vector3 {
  const p = PLANETS[key]
  const a = (p.angleDeg * Math.PI) / 180
  const r = helioRadius(p.au)
  return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
}

// Asteroid belt radius band (between Mars and Jupiter).
export const BELT_INNER = helioRadius(2.1)
export const BELT_OUTER = helioRadius(3.3)

// ── Mission-specific endpoint bodies (heliocentric positions) ──
export const ENDPOINT_POS: Record<EndpointBody, THREE.Vector3> = {
  // Titan sits just off Saturn.
  TITAN: helioPos('SATURN').clone().add(new THREE.Vector3(4.5, 0.6, 2.5)),
  // Comet 67P — between Mars and Jupiter.
  COMET_67P: (() => {
    const a = (250 * Math.PI) / 180
    const r = helioRadius(3.5)
    return new THREE.Vector3(Math.cos(a) * r, 1.5, Math.sin(a) * r)
  })(),
  // Ryugu — near-Earth orbit.
  RYUGU: (() => {
    const a = (150 * Math.PI) / 180
    const r = helioRadius(1.19)
    return new THREE.Vector3(Math.cos(a) * r, -0.8, Math.sin(a) * r)
  })(),
}

export const ENDPOINT_RADIUS: Record<EndpointBody, number> = {
  TITAN: 0.9,
  COMET_67P: 0.7,
  RYUGU: 0.5,
}

// Smooth, evenly-sampled points along a Catmull-Rom curve through anchors.
export function smoothCurve(anchors: THREE.Vector3[], samples = 160): THREE.Vector3[] {
  if (anchors.length < 2) return anchors.slice()
  const curve = new THREE.CatmullRomCurve3(anchors, false, 'catmullrom', 0.5)
  return curve.getPoints(samples)
}
