import { useMissionStore } from '@/store/missionStore'

// v1.2 H3: camera chip, top-right below the scale chip. Click cycles the camera
// mode PERSPECTIVE → TOP DOWN → FREE → PERSPECTIVE. This is the only chip that
// is interactive (pointer-events-auto).
const LABEL: Record<string, string> = {
  PERSPECTIVE: 'PERSPECTIVE',
  TOP_DOWN: 'TOP DOWN',
  FREE: 'FREE',
}

export default function CameraChip() {
  const hudCameraMode = useMissionStore((s) => s.hudCameraMode)
  const cycle = useMissionStore((s) => s.cycleHudCameraMode)

  return (
    <button
      onClick={cycle}
      aria-label="Cycle camera mode"
      className="pointer-events-auto absolute right-4 top-12 z-10 rounded-sm border border-border bg-surface/90 px-2 py-1 font-caption-mono text-[10px] tracking-[0.1em] text-text-secondary transition-colors hover:text-text-primary"
    >
      CAM · {LABEL[hudCameraMode]}
    </button>
  )
}
