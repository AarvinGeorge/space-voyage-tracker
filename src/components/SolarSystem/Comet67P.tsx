import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ENDPOINT_POS, ENDPOINT_RADIUS } from '@/lib/solarSystem'

// Comet 67P/Churyumov–Gerasimenko — irregular two-lobe "rubber duck" mass
// (procedural, NOT a sphere). Fades in when Rosetta is selected.
export default function Comet67P({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null)
  const mats = useRef<THREE.MeshStandardMaterial[]>([])
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25
    const target = active ? 1 : 0
    for (const m of mats.current) {
      if (m) m.opacity += (target - m.opacity) * Math.min(delta * 4, 1)
    }
  })
  const r = ENDPOINT_RADIUS.COMET_67P
  const register = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    if (m) mats.current[i] = m
  }
  return (
    <group ref={group} position={ENDPOINT_POS.COMET_67P.toArray()}>
      {/* Large lobe (body) */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial ref={register(0)} color="#54504a" flatShading roughness={1} transparent opacity={0} />
      </mesh>
      {/* Small lobe (head) */}
      <mesh position={[r * 1.15, r * 0.3, 0]} scale={[0.7, 0.7, 0.7]}>
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial ref={register(1)} color="#5e5950" flatShading roughness={1} transparent opacity={0} />
      </mesh>
      {/* Neck */}
      <mesh position={[r * 0.6, r * 0.15, 0]} scale={[0.5, 0.4, 0.5]}>
        <icosahedronGeometry args={[r, 0]} />
        <meshStandardMaterial ref={register(2)} color="#4a463f" flatShading roughness={1} transparent opacity={0} />
      </mesh>
    </group>
  )
}
