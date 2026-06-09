import type { Mission } from '@/data/types'
import { getStatus } from '@/data/missionsList'
import StatusDot from '@/components/shared/StatusDot'
import { cn } from '@/lib/utils'

// Single mission row. Active state = the locked A+B combo treatment
// (DESIGN.md): #141414 row bg + 3px white left bar + ▸ caret + MONO SB white
// name. NOT inversion.
export default function MissionRow({
  mission,
  active,
  onSelect,
  onHover,
}: {
  mission: Mission
  active: boolean
  onSelect: () => void
  onHover: (id: string | null) => void
}) {
  const status = getStatus(mission)
  const year = new Date(mission.launchDate).getUTCFullYear()

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(mission.id)}
      onMouseLeave={() => onHover(null)}
      aria-current={active}
      className={cn(
        'relative flex h-8 w-full items-center pr-2 text-left transition-colors',
        active ? 'bg-surface-elevated' : 'bg-transparent hover:bg-surface-elevated',
      )}
    >
      {/* A: 3px white left bar (active only) */}
      {active && <span className="absolute left-0 top-0 h-8 w-[3px] bg-white" />}

      {/* B: ▸ caret (active only) — vertically centred, clear of the 3px bar */}
      {active && (
        <span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 font-body-mono text-[12px] font-semibold leading-none text-white">
          ▸
        </span>
      )}

      <span
        className={cn(
          'flex-1 truncate font-body-mono uppercase',
          active
            ? 'pl-8 text-[11px] font-semibold tracking-[0.08em] text-white'
            : 'pl-6 text-[11px] font-medium tracking-[0.06em] text-text-primary',
        )}
      >
        {mission.name}
      </span>

      <span className="mr-3 shrink-0 font-body-mono text-[10px] tracking-[0.04em] text-text-muted">
        {year}
      </span>
      <StatusDot status={status} />
    </button>
  )
}
