import { Menu } from 'lucide-react'
import ViewModeToggle from './ViewModeToggle'

// Top bar (Frame 10:5): 56px · #000 · 1px bottom border. Wordmark 16px/0.12em +
// subtitle 11px/0.12em + 140×32 view-mode toggle (desktop). Mobile: hamburger +
// "SVT" wordmark + "SPACE VOYAGE" subtitle; the toggle moves into the menu sheet.
export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background pl-4 pr-6 sm:pl-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary sm:hidden"
            aria-label="Open missions"
          >
            <Menu size={18} />
          </button>
        )}
        {/* Mobile wordmark */}
        <span className="font-heading-mono text-[15px] font-medium tracking-[0.12em] text-text-primary sm:hidden">
          SVT
        </span>
        {/* Desktop wordmark */}
        <span className="hidden font-heading-mono text-[16px] font-medium tracking-[0.12em] text-text-primary sm:inline">
          SPACE VOYAGE TRACKER
        </span>
        <span className="font-caption-mono text-[11px] tracking-[0.12em] text-text-muted">
          <span className="sm:hidden">SPACE VOYAGE</span>
          <span className="hidden sm:inline">25 MISSIONS · 1957 → 2026</span>
        </span>
      </div>

      {/* Toggle is desktop-only; on mobile it lives in the menu sheet. */}
      <div className="hidden sm:block">
        <ViewModeToggle />
      </div>
    </header>
  )
}
