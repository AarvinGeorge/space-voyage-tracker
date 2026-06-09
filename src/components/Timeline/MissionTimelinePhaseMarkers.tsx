import type { MilestoneEvent } from '@/data/types'
import { cn } from '@/lib/utils'

// Phase markers along the track (PRD F8): a tick + label per milestone event.
// Visited markers brighten; markers ahead of the pin dim.
export default function MissionTimelinePhaseMarkers({
  events,
  t,
  showLabels,
}: {
  events: MilestoneEvent[]
  t: number
  showLabels: boolean
}) {
  return (
    <>
      {events.map((ev, i) => {
        const visited = ev.t <= t + 0.001
        return (
          <div
            key={`${ev.label}-${i}`}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2"
            style={{ left: `${ev.t * 100}%` }}
          >
            <div
              className={cn('h-[10px] w-px -translate-x-1/2', visited ? 'bg-text-secondary' : 'bg-border')}
            />
            {showLabels && (
              <span
                className={cn(
                  'absolute left-1/2 top-[10px] -translate-x-1/2 whitespace-nowrap font-body-mono text-[8px] uppercase tracking-[0.1em]',
                  visited ? 'text-text-secondary' : 'text-border',
                )}
              >
                {ev.label}
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}
