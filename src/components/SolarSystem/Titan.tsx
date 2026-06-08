import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ENDPOINT_POS, ENDPOINT_RADIUS } from '@/lib/solarSystem'

// Saturn's moon Titan — hazy orange body. Fades in when Cassini is selected.
export default function Titan({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1
    if (matRef.current) {
      const target = active ? 1 : 0
      matRef.current.opacity += (target - matRef.current.opacity) * Math.min(delta * 4, 1)
    }
  })
  const r = ENDPOINT_RADIUS.TITAN
  return (
    <mesh ref={ref} position={ENDPOINT_POS.TITAN.toArray()}>
      <icosahedronGeometry args={[r, 2]} />
      <meshStandardMaterial
        ref={matRef}
        color="#d9933f"
        emissive="#7a4a14"
        emissiveIntensity={0.3}
        flatShading
        roughness={0.85}
        transparent
        opacity={0}
      />
    </mesh>
  )
}
