import { useMemo, useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMissionStore } from '@/store/missionStore'
import {
  AGENCY_ORDER,
  AGENCY_LABELS,
  DEFAULT_EXPANDED_AGENCIES,
  getMissionsByAgency,
} from '@/data/missionsList'
import type { AgencyCode } from '@/data/types'
import AgencyGroup from './AgencyGroup'
import MissionSearch from './MissionSearch'
import { cn } from '@/lib/utils'

const SPINE: Record<AgencyCode, string> = {
  NASA: 'NASA',
  SPACEX: 'SPX',
  CNSA: 'CNSA',
  ROSCOSMOS: 'ROS',
  ESA: 'ESA',
  JAXA: 'JAXA',
  ISRO: 'ISRO',
  BLUE_ORIGIN: 'BO',
  INSPIRATION4: 'I4',
}

export default function MissionSidebar({
  mobile = false,
  onMissionSelected,
}: {
  mobile?: boolean
  onMissionSelected?: () => void
}) {
  const selectedMissionId = useMissionStore((s) => s.selectedMissionId)
  const selectMission = useMissionStore((s) => s.selectMission)
  const setHoveredMission = useMissionStore((s) => s.setHoveredMission)
  const searchQuery = useMissionStore((s) => s.searchQuery)
  const collapsed = useMissionStore((s) => s.sidebarCollapsed)
  const setCollapsed = useMissionStore((s) => s.setSidebarCollapsed)

  const [expanded, setExpanded] = useState<Set<AgencyCode>>(
    () => new Set(DEFAULT_EXPANDED_AGENCIES),
  )

  const groups = useMemo(() => getMissionsByAgency(), [])
  const q = searchQuery.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q) return groups
    return groups
      .map((g) => ({ ...g, missions: g.missions.filter((m) => m.name.toLowerCase().includes(q)) }))
      .filter((g) => g.missions.length > 0)
  }, [groups, q])

  const handleSelect = (id: string) => {
    selectMission(id)
    onMissionSelected?.()
  }

  // ── Collapsed spine (desktop) ──
  if (collapsed && !mobile) {
    return (
      <aside className="flex h-full w-12 shrink-0 flex-col items-center border-r border-border-strong bg-surface py-3">
        <button
          onClick={() => setCollapsed(false)}
          className="mb-4 text-text-secondary hover:text-text-primary"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
        <div className="flex flex-col items-center gap-3">
          {AGENCY_ORDER.map((a) => (
            <button
              key={a}
              onClick={() => setCollapsed(false)}
              className="font-caption-mono text-[9px] tracking-[0.1em] text-text-muted hover:text-text-primary"
              title={AGENCY_LABELS[a]}
            >
              {SPINE[a]}
            </button>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-surface',
        mobile ? 'w-full' : 'w-[280px] shrink-0 border-r border-border-strong',
      )}
    >
      <div className="flex items-center justify-between bg-surface-elevated px-3 py-2">
        <span className="font-caption-mono text-caption-mono tracking-[0.12em] text-text-primary">
          MISSIONS BY AGENCY
        </span>
        {!mobile && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-text-secondary hover:text-text-primary"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      <div className="pt-2">
        <MissionSearch />
      </div>

      <ScrollArea className="flex-1">
        {filtered.map((g) => (
          <AgencyGroup
            key={g.agency}
            label={g.label}
            missions={g.missions}
            open={q ? true : expanded.has(g.agency)}
            onOpenChange={(open) =>
              setExpanded((prev) => {
                const next = new Set(prev)
                if (open) next.add(g.agency)
                else next.delete(g.agency)
                return next
              })
            }
            selectedMissionId={selectedMissionId}
            onSelect={handleSelect}
            onHover={setHoveredMission}
          />
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-4 font-caption-mono text-caption-mono tracking-[0.1em] text-text-muted">
            NO MISSIONS MATCH “{searchQuery.toUpperCase()}”
          </p>
        )}
      </ScrollArea>

      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <button
          onClick={() => setExpanded(new Set(AGENCY_ORDER))}
          className="font-caption-mono text-[10px] tracking-[0.1em] text-text-muted hover:text-text-primary"
        >
          EXPAND ALL
        </button>
        <span className="text-text-muted">·</span>
        <button
          onClick={() => setExpanded(new Set())}
          className="font-caption-mono text-[10px] tracking-[0.1em] text-text-muted hover:text-text-primary"
        >
          COLLAPSE ALL
        </button>
      </div>
    </aside>
  )
}
