import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Mission } from '@/data/types'
import MissionRow from './MissionRow'
import { cn } from '@/lib/utils'

// Collapsible agency group (v1.3 F1.4 / F1.5). Header is 28px with the label +
// count inline-left and the chevron right-aligned (per Figma Frame 2 node 11:4 —
// chevron at the right edge, NOT left). A 1px hairline separator renders above
// every group except the first (isFirst), centred in the 8px inter-group gap
// (my-1 = 4px above + 4px below).
export default function AgencyGroup({
  label,
  missions,
  isFirst,
  open,
  onOpenChange,
  selectedMissionId,
  onSelect,
  onHover,
}: {
  label: string
  missions: Mission[]
  isFirst: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMissionId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <>
      {/* F1.5 hairline — between consecutive groups only (24px h-margin, 4px/4px) */}
      {!isFirst && <hr className="mx-6 my-1 border-t border-border" />}

      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="flex h-7 w-full items-center justify-between px-3 transition-colors duration-150 ease-out hover:bg-surface-elevated">
          <span className="flex items-baseline">
            <span className="font-caption-mono text-[11px] font-semibold tracking-[0.12em] text-text-primary">
              {label}
            </span>
            <span className="ml-1 font-caption-mono text-[10px] tracking-[0.08em] text-text-muted">
              · {missions.length}
            </span>
          </span>
          <ChevronDown
            size={12}
            className={cn(
              'shrink-0 text-text-secondary transition-transform duration-150 ease-out',
              !open && '-rotate-90',
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {missions.map((m) => (
            <MissionRow
              key={m.id}
              mission={m}
              active={selectedMissionId === m.id}
              onSelect={() => onSelect(m.id)}
              onHover={onHover}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
