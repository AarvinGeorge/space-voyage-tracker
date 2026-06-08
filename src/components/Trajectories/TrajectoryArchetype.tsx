import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { getTrajectoryPoints, getTrajectoryCurve } from '@/lib/trajectories'
import { useMissionStore } from '@/store/missionStore'

// Renders the selected mission's archetype trajectory with the locked Option B
// path treatment (PRD F8.1): pure white with an opacity ramp 0.3 → 1.0 along
// the flown portion, #5C5C5C for the portion ahead of the scrubber. On black,
// luminance == perceived opacity, so the ramp is encoded as vertex luminance.
// Plus a 1.5s animated draw-in and a spacecraft chevron + white endpoint glow.

const DIM = 0.36 // #5C5C5C ≈ 0.36 luminance — the "ahead" colour
const DRAW_MS = 1500

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3)
}

export default function TrajectoryArchetype({ mission }: { mission: Mission }) {
  const reduceMotion = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  )

  const points = useMemo(() => getTrajectoryPoints(mission), [mission.id])
  const curve = useMemo(() => getTrajectoryCurve(mission), [mission.id])

  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3)
    points.forEach((p, i) => {
      arr[i * 3] = p.x
      arr[i * 3 + 1] = p.y
      arr[i * 3 + 2] = p.z
    })
    return arr
  }, [points])

  const flownColors = useMemo(() => new Float32Array(points.length * 3), [points])
  const aheadColors = useMemo(() => {
    const arr = new Float32Array(points.length * 3)
    arr.fill(DIM)
    return arr
  }, [points])

  const flownRef = useRef<THREE.Line>(null)
  const aheadRef = useRef<THREE.Line>(null)
  const chevron = useRef<THREE.Group>(null)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null)
  const drawStart = useRef<number | null>(null)

  // Restart the draw-in animation whenever the mission changes.
  useEffect(() => {
    drawStart.current = null
  }, [mission.id])

  useFrame((state) => {
    const N = points.length
    if (N < 2) return
    if (drawStart.current === null) drawStart.current = state.clock.elapsedTime

    const elapsed = (state.clock.elapsedTime - drawStart.current) * 1000
    const drawP = reduceMotion ? 1 : easeOutCubic(Math.min(elapsed / DRAW_MS, 1))
    const revealCount = Math.max(2, Math.floor(drawP * N))

    const missionT = useMissionStore.getState().missionT
    const curIdx = Math.max(0, Math.min(Math.round(missionT * (N - 1)), revealCount - 1))

    // Flown portion: luminance ramp 0.3 → 1.0 up to the scrubber position.
    for (let i = 0; i <= curIdx; i++) {
      const b = curIdx === 0 ? 1 : 0.3 + 0.7 * (i / curIdx)
      flownColors[i * 3] = b
      flownColors[i * 3 + 1] = b
      flownColors[i * 3 + 2] = b
    }
    if (flownRef.current) {
      const geo = flownRef.current.geometry as THREE.BufferGeometry
      ;(geo.attributes.color as THREE.BufferAttribute).needsUpdate = true
      geo.setDrawRange(0, curIdx + 1)
    }
    if (aheadRef.current) {
      const geo = aheadRef.current.geometry as THREE.BufferGeometry
      geo.setDrawRange(curIdx, Math.max(0, revealCount - curIdx))
    }

    // Spacecraft chevron at the scrubber position, oriented along the tangent.
    if (chevron.current) {
      const pos = curve.getPoint(missionT)
      chevron.current.position.copy(pos)
      const tan = curve.getTangent(missionT)
      if (tan.lengthSq() > 1e-6) {
        const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), tan, new THREE.Vector3(0, 1, 0))
        chevron.current.quaternion.setFromRotationMatrix(m)
      }
    }
    if (glowMat.current) {
      const pulse = 0.3 + 0.12 * Math.sin(state.clock.elapsedTime * 2.2)
      glowMat.current.opacity = pulse
    }
  })

  // Scale the chevron to the scene frame (heliocentric units are smaller).
  const glyphScale = mission.viewMode === 'HELIOCENTRIC' ? 1.0 : 3.2

  return (
    <group>
      {/* Ahead-of-scrubber portion (dim) */}
      {/* @ts-expect-error R3F line intrinsic */}
      <line ref={aheadRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[aheadColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </line>

      {/* Flown portion (white luminance ramp) */}
      {/* @ts-expect-error R3F line intrinsic */}
      <line ref={flownRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[flownColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent />
      </line>

      {/* Spacecraft chevron + white endpoint glow */}
      <group ref={chevron} scale={glyphScale}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 1.4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.6, 16, 16]} />
          <meshBasicMaterial ref={glowMat} color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
