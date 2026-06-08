import { useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import type { Mission } from '@/data/types'
import { getStatus } from '@/data/missionsList'
import StatusDot from '@/components/shared/StatusDot'

// TAG state (PRD F4 state 2): 240×48 HUD chip. Whole tag is draggable.
export default function MissionTag({
  mission,
  onHeaderPointerDown,
  onExpand,
  onClose,
}: {
  mission: Mission
  onHeaderPointerDown?: (e: React.PointerEvent) => void
  onExpand: () => void
  onClose: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const status = getStatus(mission)
  const year = new Date(mission.launchDate).getUTCFullYear()

  return (
    <div
      onPointerDown={onHeaderPointerDown}
      className="flex h-12 w-60 cursor-grab items-center gap-2 rounded-md border border-border bg-surface px-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] active:cursor-grabbing"
    >
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-grey-2">
        {!imgFailed ? (
          <img
            src={mission.heroImageUrl}
            alt=""
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="truncate font-body-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-text-primary">
          {mission.name}
        </span>
        <span className="truncate font-caption-mono text-[9px] tracking-[0.1em] text-text-muted">
          {mission.agency.toUpperCase()} · {year} · {mission.destination.toUpperCase()}
        </span>
      </div>
      <StatusDot status={status} />
      <button
        onClick={onExpand}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 text-text-secondary hover:text-text-primary"
        aria-label="Expand card"
      >
        <Maximize2 size={13} />
      </button>
      <button
        onClick={onClose}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 text-text-secondary hover:text-live-red"
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  )
}
