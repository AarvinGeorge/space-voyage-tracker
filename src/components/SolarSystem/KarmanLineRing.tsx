import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { KARMAN_R } from '@/lib/solarSystem'

// Thin ring around Earth at ~100 km altitude. Always faintly visible (5%),
// brighter when a suborbital mission is selected — without it, suborbital
// ballistic arcs look like they go nowhere.
export default function KarmanLineRing({ active }: { active: boolean }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * KARMAN_R, 0, Math.sin(a) * KARMAN_R))
    }
    return pts
  }, [])
  return (
    <Line
      points={points}
      color={active ? '#7a8a9a' : '#3a3a3a'}
      lineWidth={1}
      transparent
      opacity={active ? 0.5 : 0.05}
      dashed
      dashSize={0.6}
      gapSize={0.6}
    />
  )
}
