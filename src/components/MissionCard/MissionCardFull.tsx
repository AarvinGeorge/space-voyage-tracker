import { GripVertical, Minimize2, X } from 'lucide-react'
import type { Mission } from '@/data/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import MissionCardHero from './MissionCardHero'
import MissionCardFacts from './MissionCardFacts'
import MissionCardSummary from './MissionCardSummary'
import { hasSummary } from '@/data/summaries'

// FULL state card (PRD F4 state 1). All content is data-driven from mission.*.
export default function MissionCardFull({
  mission,
  onHeaderPointerDown,
  onMinimize,
  onClose,
}: {
  mission: Mission
  onHeaderPointerDown?: (e: React.PointerEvent) => void
  onMinimize: () => void
  onClose: () => void
}) {
  const year = new Date(mission.launchDate).getUTCFullYear()
  const aiCredit = hasSummary(mission.id) ? 'SUMMARY: AI-GENERATED, CLAUDE SONNET 4.6' : 'SUMMARY: PENDING BUILD-TIME GENERATION'

  return (
    <div className="flex max-h-[640px] w-[480px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-md border border-border bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Header strip */}
      <div
        onPointerDown={onHeaderPointerDown}
        className="flex h-12 shrink-0 cursor-grab items-center gap-2 bg-surface-elevated px-3 active:cursor-grabbing"
      >
        <GripVertical size={14} className="shrink-0 text-text-muted" />
        <span className="rounded-sm border border-border px-1.5 py-0.5 font-caption-mono text-[9px] tracking-[0.1em] text-text-secondary">
          {mission.agency.toUpperCase()}
        </span>
        <span className="flex-1 truncate font-heading-mono text-[13px] font-medium tracking-[0.06em] text-text-primary">
          {mission.name.toUpperCase()}
        </span>
        <span className="shrink-0 font-body-mono text-[11px] tracking-[0.04em] text-text-muted">{year}</span>
        <button
          onClick={onMinimize}
          className="shrink-0 text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Minimize to tag"
        >
          <Minimize2 size={14} />
        </button>
        <button
          onClick={onClose}
          className="shrink-0 text-text-secondary transition-transform hover:scale-105 hover:text-live-red"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <MissionCardHero mission={mission} />
        <MissionCardFacts mission={mission} />
        <MissionCardSummary mission={mission} />
      </ScrollArea>

      {/* Footer strip */}
      <div className="flex shrink-0 flex-col gap-0.5 bg-surface-elevated px-3 py-2">
        <span className="truncate font-caption-mono text-[9px] tracking-[0.1em] text-text-muted">
          ATTRIBUTION: {mission.heroImageCredit.toUpperCase()}
        </span>
        <span className="font-caption-mono text-[9px] tracking-[0.1em] text-text-muted">{aiCredit}</span>
      </div>
    </div>
  )
}
