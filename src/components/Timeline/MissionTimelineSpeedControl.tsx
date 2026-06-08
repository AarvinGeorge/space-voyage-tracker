import { useMissionStore } from '@/store/missionStore'

// Speed pill (1× / 2× / 5× / 10× / 50×). Replaced by COMPLETE badge at t≥0.99.
export default function MissionTimelineSpeedControl({ t }: { t: number }) {
  const speed = useMissionStore((s) => s.playbackSpeed)
  const cycle = useMissionStore((s) => s.cycleSpeed)

  if (t >= 0.99) {
    return (
      <span className="flex h-4 items-center justify-center px-1 font-body-mono text-[7px] font-semibold tracking-[0.12em] text-text-primary">
        COMPLETE
      </span>
    )
  }

  return (
    <button
      onClick={cycle}
      aria-label="Cycle playback speed"
      className="flex h-4 min-w-[56px] items-center justify-center rounded-sm bg-surface-elevated px-2 font-body-mono text-[9px] tracking-[0.08em] text-text-secondary transition-colors hover:text-text-primary"
    >
      {speed}× SPEED
    </button>
  )
}
