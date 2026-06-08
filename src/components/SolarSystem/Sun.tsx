import { SUN_R } from '@/lib/solarSystem'

// Heliocentric Sun at the scene origin: emissive polyhedral core + layered glow.
export default function Sun() {
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={2.4} distance={0} decay={0} color="#fff4d6" />
      <mesh>
        <icosahedronGeometry args={[SUN_R, 2]} />
        <meshBasicMaterial color="#fff7e0" />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[SUN_R * 1.35, 2]} />
        <meshBasicMaterial color="#ffe27a" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[SUN_R * 1.9, 2]} />
        <meshBasicMaterial color="#ffc23d" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_R * 2.8, 24, 24]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.03} depthWrite={false} />
      </mesh>
    </group>
  )
}
