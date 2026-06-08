import { cn } from '@/lib/utils'
import type { MissionStatus } from '@/data/types'

// Small status dot — the ONLY coloured UI element (DESIGN.md). Ongoing pulses.
const COLOR: Record<MissionStatus, string> = {
  SUCCESS: 'bg-status-success',
  PARTIAL: 'bg-status-partial',
  FAILURE: 'bg-status-failure',
  ONGOING: 'bg-status-ongoing',
}

export default function StatusDot({
  status,
  size = 6,
  className,
}: {
  status: MissionStatus
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        COLOR[status],
        status === 'ONGOING' && 'motion-safe:animate-[pulse_2s_ease-in-out_infinite]',
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={status}
      title={status}
    />
  )
}
