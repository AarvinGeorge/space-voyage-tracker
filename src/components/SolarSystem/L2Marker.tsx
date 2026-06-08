import { Html } from '@react-three/drei'
import { L2_POS } from '@/lib/solarSystem'

// Dim sphere marker at the Sun-Earth L2 point (earth-system view) — gives the
// JWST halo orbit something to orbit around. Brighter when JWST is selected.
export default function L2Marker({ active }: { active: boolean }) {
  return (
    <group position={L2_POS.toArray()}>
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color={active ? '#9fb4d4' : '#3a4658'} transparent opacity={active ? 0.7 : 0.3} />
      </mesh>
      {active && (
        <Html position={[0, 2.2, 0]} center style={{ pointerEvents: 'none' }}>
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
            SUN-EARTH L2
          </span>
        </Html>
      )}
    </group>
  )
}
