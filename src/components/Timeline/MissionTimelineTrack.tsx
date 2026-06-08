import { useRef } from 'react'
import type { Mission } from '@/data/types'
import { useMissionStore } from '@/store/missionStore'
import MissionTimelinePhaseMarkers from './MissionTimelinePhaseMarkers'

// Track + scrubber pin (PRD F8 + F8.1). Background grey track + full-mission
// "available" overlay + current-progress white opacity-ramp fill + 2px white pin.
// Click to seek, drag the pin to scrub.
export default function MissionTimelineTrack({
  mission,
  t,
  showLabels,
}: {
  mission: Mission
  t: number
  showLabels: boolean
}) {
  const setMissionT = useMissionStore((s) => s.setMissionT)
  const setTimelinePlaying = useMissionStore((s) => s.setTimelinePlaying)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const seek = (clientX: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    setMissionT(Math.max(0, Math.min(1, ratio)))
  }

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Mission timeline"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(t * 100)}
      tabIndex={0}
      className="relative h-6 flex-1 cursor-pointer touch-none"
      onPointerDown={(e) => {
        dragging.current = true
        setTimelinePlaying(false)
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        seek(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && seek(e.clientX)}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') setMissionT(Math.min(1, t + 0.02))
        if (e.key === 'ArrowLeft') setMissionT(Math.max(0, t - 0.02))
      }}
    >
      {/* track lines (2px), vertically centred */}
      <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2">
        <div className="absolute inset-0 bg-scrubber-track-bg" />
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: 'linear-gradient(to right, #555, #888)' }}
        />
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${t * 100}%`,
            background: 'linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,1))',
          }}
        />
      </div>

      <MissionTimelinePhaseMarkers events={mission.milestoneEvents} t={t} showLabels={showLabels} />

      {/* pin */}
      <div
        className="pointer-events-none absolute top-1/2 h-6 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white"
        style={{ left: `${t * 100}%` }}
      />
    </div>
  )
}
