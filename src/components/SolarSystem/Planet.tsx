import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// A single polyhedral planet: IcosahedronGeometry(r, 1) + flatShading
// (NO wireframe overlay — DESIGN.md / non-negotiable). Optional Saturn ring,
// optional label, optional opacity for fade-in endpoint bodies.
export type PlanetProps = {
  position: [number, number, number]
  radius: number
  color: string
  ring?: boolean
  label?: string
  opacity?: number
  emissive?: string
  rotationSpeed?: number
}

export default function Planet({
  position,
  radius,
  color,
  ring = false,
  label,
  opacity = 1,
  emissive,
  rotationSpeed = 0.05,
}: PlanetProps) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * rotationSpeed
  })

  if (opacity <= 0.001) return null

  return (
    <group position={position}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[radius, 1]} />
        <meshStandardMaterial
          color={color}
          flatShading
          roughness={0.92}
          metalness={0.0}
          emissive={emissive ?? '#000000'}
          emissiveIntensity={emissive ? 0.5 : 0}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>

      {ring && (
        <mesh rotation={[Math.PI / 2.3, 0, 0.2]}>
          <ringGeometry args={[radius * 1.4, radius * 2.2, 48]} />
          <meshBasicMaterial
            color={color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.35 * opacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {label && (
        <Html position={[0, radius + 1.6, 0]} center style={{ pointerEvents: 'none' }}>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '8px',
              fontWeight: 500,
              letterSpacing: '0.12em',
              color: '#5c5c5c',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        </Html>
      )}
    </group>
  )
}
