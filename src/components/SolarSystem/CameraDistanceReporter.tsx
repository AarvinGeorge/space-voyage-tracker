import { useThree, useFrame } from '@react-three/fiber'
import { useMissionStore } from '@/store/missionStore'

// v1.2 H3: reports the camera→origin distance into the store each frame (throttled
// in the store) so the DOM ScaleChip can derive an approximate scale. Mounted
// inside the Canvas for both the Artemis v0 scene and the 24-mission scenes.
export default function CameraDistanceReporter() {
  const { camera } = useThree()
  const setCameraDistance = useMissionStore((s) => s.setCameraDistance)
  useFrame(() => setCameraDistance(camera.position.length()))
  return null
}
