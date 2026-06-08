import { useMissionStore } from '@/store/missionStore'

// 20×20 outlined play/pause button (PRD F8).
export default function MissionTimelinePlayButton() {
  const playing = useMissionStore((s) => s.timelinePlaying)
  const toggle = useMissionStore((s) => s.toggleTimelinePlay)

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Pause' : 'Play'}
      className="flex h-5 w-5 shrink-0 items-center justify-center border-[1.5px] border-white text-white transition-opacity hover:opacity-80"
    >
      {playing ? (
        <span className="flex gap-[2px]">
          <span className="block h-2 w-[2px] bg-white" />
          <span className="block h-2 w-[2px] bg-white" />
        </span>
      ) : (
        <span
          className="ml-[1px] block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-white"
        />
      )}
    </button>
  )
}
