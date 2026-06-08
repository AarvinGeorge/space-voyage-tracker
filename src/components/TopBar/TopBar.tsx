import { Menu } from 'lucide-react'
import { useMissionStore } from '@/store/missionStore'
import type { ViewMode } from '@/data/types'
import { cn } from '@/lib/utils'

const MODES: { key: ViewMode; label: string }[] = [
  { key: 'EARTH_SYSTEM', label: 'EARTH SYSTEM' },
  { key: 'HELIOCENTRIC', label: 'HELIOCENTRIC' },
]

// Top bar (PRD §4 · DESIGN.md): wordmark + subtitle + view-mode toggle.
export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const viewMode = useMissionStore((s) => s.viewMode)
  const setViewMode = useMissionStore((s) => s.setViewMode)

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary md:hidden"
            aria-label="Open missions"
          >
            <Menu size={18} />
          </button>
        )}
        <span className="font-heading-mono text-[1.0625rem] font-medium tracking-[0.08em] text-text-primary">
          SPACE VOYAGE TRACKER
        </span>
        <span className="hidden font-caption-mono text-caption-mono tracking-[0.12em] text-text-muted sm:inline">
          25 MISSIONS · 1957 → 2026
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-px" role="tablist" aria-label="View mode">
        {MODES.map((m) => {
          const active = viewMode === m.key
          return (
            <button
              key={m.key}
              role="tab"
              aria-selected={active}
              onClick={() => setViewMode(m.key)}
              className={cn(
                'h-8 whitespace-nowrap rounded-sm px-3 font-caption-mono text-[10px] tracking-[0.1em] transition-colors',
                active
                  ? 'bg-white text-black'
                  : 'bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              {m.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
