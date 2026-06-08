import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Mission } from '@/data/types'
import { getTrajectoryPoints } from '@/lib/trajectories'

// drei <OrbitControls> with full free navigation + smart auto-fit on mission
// selection (PRD F2.1). Used for all non-Artemis missions; Artemis keeps the
// v0 camera controller untouched.
export default function CameraRig({ mission }: { mission: Mission }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const animating = useRef(false)
  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())

  // On mission (or view-mode) change, compute a framing that fits the trajectory.
  useEffect(() => {
    const pts = getTrajectoryPoints(mission)
    const box = new THREE.Box3().setFromPoints(pts)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3()).length()
    const dist = Math.max(size * 1.15, 18)
    const dir = new THREE.Vector3(0.55, 0.5, 1).normalize()
    targetLook.current.copy(center)
    targetPos.current.copy(center).addScaledVector(dir, dist)
    animating.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.id, mission.viewMode])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || !animating.current) return
    const alpha = 1 - Math.pow(0.0025, delta)
    camera.position.lerp(targetPos.current, alpha)
    controls.target.lerp(targetLook.current, alpha)
    controls.update()
    if (
      camera.position.distanceTo(targetPos.current) < 1.5 &&
      controls.target.distanceTo(targetLook.current) < 1.5
    ) {
      camera.position.copy(targetPos.current)
      controls.target.copy(targetLook.current)
      controls.update()
      animating.current = false
    }
  })

  const isHelio = mission.viewMode === 'HELIOCENTRIC'

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate
      enableZoom
      enablePan
      enableDamping
      dampingFactor={0.05}
      minDistance={isHelio ? 12 : 8}
      maxDistance={isHelio ? 600 : 900}
      onStart={() => {
        animating.current = false
      }}
    />
  )
}
