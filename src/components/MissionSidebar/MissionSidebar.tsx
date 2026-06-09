import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMissionStore } from '@/store/missionStore'
import { AGENCY_ORDER, AGENCY_LABELS, DEFAULT_EXPANDED_AGENCIES } from '@/data/missionsList'
import type { AgencyCode } from '@/data/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFilteredMissions } from '@/hooks/useFilteredMissions'
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

// MissionSidebar — the only CONTAINER (v1.3 F1.7a). Reads selectedMissionId /
// sidebarCollapsed from the global store; owns UI-only local state (search query,
// agency expanded map, focused row). Search is local + debounced (F1.7b/c) and
// filtered via useFilteredMissions (F1.7d). Keyboard nav + ARIA per F1.7f/g.
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
  const collapsed = useMissionStore((s) => s.sidebarCollapsed)
  const setCollapsed = useMissionStore((s) => s.setSidebarCollapsed)

  // UI-only local state (F1.7b).
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<AgencyCode>>(() => new Set(DEFAULT_EXPANDED_AGENCIES))
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebouncedValue(query, 150)
  const isSearching = debouncedQuery.trim() !== ''
  const { groups, totalCount } = useFilteredMissions(debouncedQuery)

  // Flat list of currently-visible row ids (rows in open groups, in render order).
  const visibleIds = useMemo(
    () =>
      groups.flatMap((g) => (isSearching || expanded.has(g.agency) ? g.missions.map((m) => m.id) : [])),
    [groups, expanded, isSearching],
  )

  // The single tab stop: the focused row, else the selected row (if visible), else the first.
  const tabbableId =
    focusedId ??
    (selectedMissionId && visibleIds.includes(selectedMissionId) ? selectedMissionId : visibleIds[0] ?? null)

  const handleSelect = useCallback(
    (id: string) => {
      selectMission(id)
      onMissionSelected?.()
    },
    [selectMission, onMissionSelected],
  )
  const handleRowFocus = useCallback((id: string) => setFocusedId(id), [])

  const focusRowById = useCallback((id: string | undefined) => {
    if (!id) return
    setFocusedId(id)
    requestAnimationFrame(() => document.getElementById(id)?.focus())
  }, [])

  // F1.7f keyboard nav within the listbox: ArrowUp/Down traverse rows, Enter selects.
  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (!visibleIds.length) return
    const cur = focusedId ?? selectedMissionId ?? ''
    const idx = visibleIds.indexOf(cur)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusRowById(visibleIds[(idx + 1 + visibleIds.length) % visibleIds.length] ?? visibleIds[0])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusRowById(
        visibleIds[(idx - 1 + visibleIds.length) % visibleIds.length] ?? visibleIds[visibleIds.length - 1],
      )
    } else if (e.key === 'Enter' && focusedId) {
      e.preventDefault()
      handleSelect(focusedId)
    }
  }

  // F1.7f global Cmd+K / Ctrl+K focuses the search input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      role="navigation"
      aria-label="Mission browser"
      className={cn(
        'flex h-full flex-col bg-surface',
        mobile ? 'w-full' : 'w-[280px] shrink-0 border-r border-border-strong',
      )}
    >
      <div className="flex h-10 shrink-0 items-center justify-between bg-surface-elevated px-4">
        <span className="font-caption-mono text-[11px] tracking-[0.12em] text-text-primary">
          MISSIONS BY AGENCY · {totalCount}
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
        <MissionSearch
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          inputRef={searchInputRef}
        />
      </div>

      <ScrollArea
        className="flex-1"
        role="listbox"
        aria-label="Missions"
        aria-multiselectable={false}
        aria-activedescendant={focusedId ?? selectedMissionId ?? undefined}
        onKeyDown={onListKeyDown}
      >
        {groups.map((g, index) => (
          <AgencyGroup
            key={g.agency}
            label={g.label}
            missions={g.missions}
            isFirst={index === 0}
            open={isSearching ? true : expanded.has(g.agency)}
            onOpenChange={(open) =>
              setExpanded((prev) => {
                const next = new Set(prev)
                if (open) next.add(g.agency)
                else next.delete(g.agency)
                return next
              })
            }
            selectedMissionId={selectedMissionId}
            tabbableId={tabbableId}
            onSelect={handleSelect}
            onHover={setHoveredMission}
            onRowFocus={handleRowFocus}
          />
        ))}
        {groups.length === 0 && (
          <p className="px-3 py-4 font-caption-mono text-caption-mono tracking-[0.1em] text-text-muted">
            NO MISSIONS MATCH “{debouncedQuery.toUpperCase()}”
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
