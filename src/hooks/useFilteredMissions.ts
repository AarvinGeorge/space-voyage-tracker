import { useMemo } from 'react'
import { getMissionsByAgency, type AgencyGroup } from '@/data/missionsList'

// Encapsulates the sidebar's filter logic (v1.3 F1.7d). The matcher is
// `.toLowerCase().includes()` today; it can be swapped for Fuse.js fuzzy
// matching later WITHOUT touching the consumer — the hook signature is stable.
// getMissionsByAgency() is a static derivation, memoized once; the filtered
// result is memoized on the trimmed query (F1.7e).
export function useFilteredMissions(query: string): { groups: AgencyGroup[]; totalCount: number } {
  const allGroups = useMemo(() => getMissionsByAgency(), [])
  const q = query.trim().toLowerCase()

  return useMemo(() => {
    if (!q) {
      const totalCount = allGroups.reduce((sum, g) => sum + g.missions.length, 0)
      return { groups: allGroups, totalCount }
    }
    const filtered = allGroups
      .map((g) => ({ ...g, missions: g.missions.filter((m) => m.name.toLowerCase().includes(q)) }))
      .filter((g) => g.missions.length > 0)
    const totalCount = filtered.reduce((sum, g) => sum + g.missions.length, 0)
    return { groups: filtered, totalCount }
  }, [allGroups, q])
}
