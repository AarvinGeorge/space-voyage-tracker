import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { helioPos, smoothCurve } from '@/lib/solarSystem'
import type { PlanetKey } from '@/data/types'

// A Hohmann-style transfer arc between two heliocentric bodies: an elliptical
// bulge that sweeps roughly half an orbit from the departure body to the target.
export function helioTransfer(from: PlanetKey, to: PlanetKey, lift = 1.4): THREE.Vector3[] {
  const a = helioPos(from)
  const b = helioPos(to)
  const angA = Math.atan2(a.z, a.x)
  const angB = Math.atan2(b.z, b.x)
  // Sweep the long way so the arc reads as a transfer orbit (~180°).
  let mid = (angA + angB) / 2
  if (Math.abs(angB - angA) < Math.PI) mid += Math.PI
  const apoR = Math.max(a.length(), b.length()) * 1.18
  const apo = new THREE.Vector3(Math.cos(mid) * apoR, lift, Math.sin(mid) * apoR)
  return smoothCurve([a, apo, b], 150)
}

export function hohmannMars(_mission: Mission): THREE.Vector3[] {
  return helioTransfer('EARTH', 'MARS')
}

export function hohmannVenus(_mission: Mission): THREE.Vector3[] {
  return helioTransfer('EARTH', 'VENUS')
}
