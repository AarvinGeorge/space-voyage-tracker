import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Mission, TrajectoryType } from '@/data/types'
import { getTrajectoryPoints, getTrajectoryCurve } from '@/lib/trajectories'
import { useMissionStore } from '@/store/missionStore'

// Renders the selected mission's archetype trajectory with the locked Option B
// path treatment (PRD F8.1): pure white with a luminance ramp 0.3 → 1.0 along
// the flown portion, #5C5C5C ahead of the scrubber. On black, luminance ==
// perceived opacity. v1.2 H1: uses drei <Line> (fat lines) so lineWidth=2.5
// actually renders — native <line> caps at 1px and reads as empty. Draw-in is
// done via per-vertex colour (un-revealed = black = invisible on black).

const DIM = 0.36 // #5C5C5C ≈ 0.36 luminance — the "ahead" colour
const DRAW_MS = 1500

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3)
}

// v1.2 H1: glyph scale per archetype so the chevron reads at each archetype's
// natural camera distance.
function glyphScaleFor(arch: TrajectoryType): number {
  switch (arch) {
    case 'HOHMANN_MARS':
    case 'HOHMANN_VENUS':
      return 2.5 // inner solar system, framed mid-distance
    case 'GRAVITY_ASSIST_OUTER':
    case 'INTERSTELLAR':
    case 'COMET_RENDEZVOUS':
    case 'ASTEROID_RENDEZVOUS':
    case 'HYPERBOLIC_ESCAPE':
      return 1.0 // outer heliocentric, framed far
    case 'BALLISTIC_SUBORBITAL':
      return 1.5
    default:
      return 2.0 // LEO / lunar / L2 earth-system
  }
}

export default function TrajectoryArchetype({ mission }: { mission: Mission }) {
  const reduceMotion = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  )

  const points = useMemo(() => getTrajectoryPoints(mission), [mission.id])
  const curve = useMemo(() => getTrajectoryCurve(mission), [mission.id])

  // Flat RGB buffer reused each frame; initial vertexColors enable vertex-colour mode.
  const colors = useMemo(() => new Float32Array(points.length * 3), [points])
  const initialVertexColors = useMemo(
    () => points.map(() => [0, 0, 0] as [number, number, number]),
    [points],
  )

  const lineRef = useRef<any>(null)
  const chevron = useRef<THREE.Group>(null)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null)
  const drawStart = useRef<number | null>(null)

  // Restart the draw-in whenever the mission changes.
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

    for (let i = 0; i < N; i++) {
      let b: number
      if (i <= curIdx) b = curIdx === 0 ? 1 : 0.3 + 0.7 * (i / curIdx) // flown ramp
      else if (i <= revealCount) b = DIM // ahead, revealed
      else b = 0 // not yet drawn-in → black → invisible on black
      colors[i * 3] = b
      colors[i * 3 + 1] = b
      colors[i * 3 + 2] = b
    }
    if (lineRef.current?.geometry?.setColors) lineRef.current.geometry.setColors(colors)

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
      glowMat.current.opacity = 0.32 + 0.12 * Math.sin(state.clock.elapsedTime * 2.2)
    }
  })

  const glyphScale = glyphScaleFor(mission.trajectoryArchetype)

  return (
    <group>
      {/* Trajectory: fat line, 2.5px, vertex-coloured luminance ramp (Option B) */}
      <Line
        ref={lineRef}
        points={points}
        vertexColors={initialVertexColors}
        lineWidth={2.5}
        transparent
      />

      {/* Spacecraft chevron + white endpoint glow */}
      <group ref={chevron} scale={glyphScale}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 1.4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.6, 16, 16]} />
          <meshBasicMaterial ref={glowMat} color="#ffffff" transparent opacity={0.32} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
