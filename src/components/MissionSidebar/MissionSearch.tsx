import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useMissionStore } from '@/store/missionStore'

// Top-of-sidebar search — filters mission rows in real time (PRD F1).
export default function MissionSearch() {
  const searchQuery = useMissionStore((s) => s.searchQuery)
  const setSearchQuery = useMissionStore((s) => s.setSearchQuery)

  return (
    <div className="relative px-3 pb-2">
      <Search
        size={13}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-[9px] text-text-muted"
      />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="SEARCH MISSIONS"
        aria-label="Search missions"
        className="h-8 pl-7 font-caption-mono text-[11px] tracking-[0.08em] uppercase placeholder:text-text-muted"
      />
    </div>
  )
}
