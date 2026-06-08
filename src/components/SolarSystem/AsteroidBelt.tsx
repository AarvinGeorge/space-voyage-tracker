import { useMemo } from 'react'
import * as THREE from 'three'
import { BELT_INNER, BELT_OUTER } from '@/lib/solarSystem'

function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Procedural ring of small low-poly rocks between Mars and Jupiter (heliocentric).
export default function AsteroidBelt({ count = 420 }: { count?: number }) {
  const { geometry, matrices } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.12, 0)
    const mats: THREE.Matrix4[] = []
    for (let i = 0; i < count; i++) {
      const a = seeded(i * 3.1) * Math.PI * 2
      const r = BELT_INNER + seeded(i * 7.7) * (BELT_OUTER - BELT_INNER)
      const y = (seeded(i * 5.3) - 0.5) * 1.6
      const s = 0.4 + seeded(i * 9.1) * 1.3
      const m = new THREE.Matrix4()
      m.makeScale(s, s, s)
      m.setPosition(Math.cos(a) * r, y, Math.sin(a) * r)
      mats.push(m)
    }
    return { geometry: geo, matrices: mats }
  }, [count])

  return (
    <instancedMesh args={[geometry, undefined, matrices.length]} ref={(inst) => {
      if (!inst) return
      matrices.forEach((m, i) => inst.setMatrixAt(i, m))
      inst.instanceMatrix.needsUpdate = true
    }}>
      <meshStandardMaterial color="#6b6258" flatShading roughness={1} metalness={0} />
    </instancedMesh>
  )
}
