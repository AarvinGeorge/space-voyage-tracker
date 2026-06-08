import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Mission } from '@/data/types'
import MissionRow from './MissionRow'
import { cn } from '@/lib/utils'

// Collapsible agency group with a mission-count badge.
export default function AgencyGroup({
  label,
  missions,
  open,
  onOpenChange,
  selectedMissionId,
  onSelect,
  onHover,
}: {
  label: string
  missions: Mission[]
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMissionId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b border-border/60">
      <CollapsibleTrigger className="group flex w-full items-center justify-between px-3 py-2">
        <span className="flex items-center gap-2">
          <ChevronDown
            size={12}
            className={cn(
              'text-text-muted transition-transform',
              !open && '-rotate-90',
            )}
          />
          <span className="font-caption-mono text-caption-mono tracking-[0.12em] text-text-secondary">
            {label}
          </span>
        </span>
        <span className="font-caption-mono text-[10px] tracking-[0.1em] text-text-muted">
          {missions.length}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-1">
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
  )
}
