import { useMissionStore } from '@/store/missionStore'
import type { ViewMode } from '@/data/types'
import { cn } from '@/lib/utils'

const MODES: { key: ViewMode; label: string }[] = [
  { key: 'EARTH_SYSTEM', label: 'EARTH SYSTEM' },
  { key: 'HELIOCENTRIC', label: 'HELIOCENTRIC' },
]

// Two adjacent 140×32 segments (Frame 10:5). Inactive: surface + 1px border +
// text-secondary; active: white/black inversion, no border; hover: white text.
export default function ViewModeToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const viewMode = useMissionStore((s) => s.viewMode)
  const setViewMode = useMissionStore((s) => s.setViewMode)

  return (
    <div className={cn('flex items-center', fullWidth && 'w-full')} role="tablist" aria-label="View mode">
      {MODES.map((m) => {
        const active = viewMode === m.key
        return (
          <button
            key={m.key}
            role="tab"
            aria-selected={active}
            onClick={() => setViewMode(m.key)}
            className={cn(
              'h-8 whitespace-nowrap rounded-sm font-caption-mono text-[10px] tracking-[0.1em] transition-colors',
              fullWidth ? 'flex-1' : 'w-[140px]',
              active
                ? 'bg-white text-black'
                : 'border border-border bg-surface text-text-secondary hover:text-text-primary',
            )}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
