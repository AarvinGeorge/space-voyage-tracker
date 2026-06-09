import { useMissionStore } from '@/store/missionStore'

// v1.2 H3: scale chip, top-right. Approximate "1 px ≈ N km" derived from the
// camera distance (reported by CameraRig) and the canvas height.
//
// FOV is 45°, so the world height visible at the target ≈ 2·D·tan(22.5°).
// km-per-scene-unit is exact for the Earth-system frame (1 unit = 1000 km) and
// an approximation for the log-compressed heliocentric frame.
const TAN_HALF_FOV = Math.tan((45 * Math.PI) / 180 / 2)
const KM_PER_UNIT_EARTH = 1_000
const KM_PER_UNIT_HELIO = 8_000_000 // ~1 AU ≈ 19 units near Earth → ~7.9M km/unit

function format(km: number): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M KM`
  if (km >= 1_000) return `${Math.round(km / 1_000).toLocaleString('en-US')},000 KM`
  return `${Math.round(km).toLocaleString('en-US')} KM`
}

const CHIP =
  'pointer-events-none absolute z-10 rounded-sm border border-border bg-surface/90 px-2 py-1 font-caption-mono text-[10px] tracking-[0.1em] text-text-secondary'

export default function ScaleChip() {
  const cameraDistance = useMissionStore((s) => s.cameraDistance)
  const viewMode = useMissionStore((s) => s.viewMode)

  const canvasH = (typeof document !== 'undefined' && document.querySelector('canvas')?.clientHeight) || 700
  const worldHeightUnits = 2 * cameraDistance * TAN_HALF_FOV
  const unitsPerPx = worldHeightUnits / canvasH
  const kmPerUnit = viewMode === 'HELIOCENTRIC' ? KM_PER_UNIT_HELIO : KM_PER_UNIT_EARTH
  const kmPerPx = unitsPerPx * kmPerUnit

  return (
    <div className={`${CHIP} right-4 top-4`}>1 PX ≈ {format(kmPerPx)}</div>
  )
}
