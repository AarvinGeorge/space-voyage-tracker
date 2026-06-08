import { useEffect, useRef } from 'react'
import { useMissionStore } from '@/store/missionStore'
import { getMissionById } from '@/data/missionsList'
import { useIsMobile } from '@/hooks/useIsMobile'
import MissionTimelinePlayButton from './MissionTimelinePlayButton'
import MissionTimelineTrack from './MissionTimelineTrack'
import MissionTimelineTimestamp from './MissionTimelineTimestamp'
import MissionTimelineSpeedControl from './MissionTimelineSpeedControl'

// Full mission timeline (PRD F8) — replaces v0's PhaseScrubber for ALL missions.
// Compact 720px floating overlay, 32px above the canvas bottom.
const BASE_RATE = 1 / 45 // a 1× sweep completes in ~45s

export default function MissionTimeline() {
  const selectedMissionId = useMissionStore((s) => s.selectedMissionId)
  const t = useMissionStore((s) => s.missionT)
  const playing = useMissionStore((s) => s.timelinePlaying)
  const isMobile = useIsMobile()
  const raf = useRef<number | null>(null)
  const last = useRef<number>(0)

  // Playback loop — advances missionT while playing; auto-pauses at the end.
  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const step = (now: number) => {
      const dt = (now - last.current) / 1000
      last.current = now
      const { missionT, playbackSpeed, setMissionT, setTimelinePlaying } = useMissionStore.getState()
      const next = missionT + dt * BASE_RATE * playbackSpeed
      if (next >= 1) {
        setMissionT(1)
        setTimelinePlaying(false) // do NOT loop
        return
      }
      setMissionT(next)
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [playing])

  const mission = getMissionById(selectedMissionId)
  if (!mission) return null

  return (
    <div
      className="pointer-events-auto absolute bottom-8 left-1/2 z-20 w-[720px] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-md border border-border bg-surface px-4 shadow-[0_8px_28px_rgba(0,0,0,0.6)]"
      style={{ height: isMobile ? 56 : 72 }}
    >
      {/* header label + timestamp */}
      <div className="relative flex h-6 items-center justify-center">
        {!isMobile && (
          <span className="font-body-mono text-[9px] font-medium tracking-[0.12em] text-text-muted">
            MISSION TIMELINE
          </span>
        )}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <MissionTimelineTimestamp mission={mission} t={t} />
        </div>
      </div>

      {/* controls row */}
      <div className="flex items-center gap-3">
        <MissionTimelinePlayButton />
        <MissionTimelineTrack mission={mission} t={t} showLabels={!isMobile} />
        <MissionTimelineSpeedControl t={t} />
      </div>
    </div>
  )
}
