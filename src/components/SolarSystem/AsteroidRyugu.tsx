import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ENDPOINT_POS, ENDPOINT_RADIUS } from '@/lib/solarSystem'

// Asteroid Ryugu — small dark spinning-top spheroid. Fades in when Hayabusa 2
// is selected.
export default function AsteroidRyugu({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4
    if (matRef.current) {
      const target = active ? 1 : 0
      matRef.current.opacity += (target - matRef.current.opacity) * Math.min(delta * 4, 1)
    }
  })
  const r = ENDPOINT_RADIUS.RYUGU
  return (
    <mesh ref={ref} position={ENDPOINT_POS.RYUGU.toArray()} scale={[1, 0.78, 1]}>
      <icosahedronGeometry args={[r, 1]} />
      <meshStandardMaterial ref={matRef} color="#4a463f" flatShading roughness={1} transparent opacity={0} />
    </mesh>
  )
}
