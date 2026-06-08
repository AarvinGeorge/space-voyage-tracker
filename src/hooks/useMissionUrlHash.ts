import { useEffect, useRef } from 'react'
import { useMissionStore } from '@/store/missionStore'
import { getMissionById } from '@/data/missionsList'

// Bidirectional sync between selectedMissionId and the URL (?mission=apollo-11).
// Reads on load; writes on change via history.replaceState (no reload). PRD F6.
export function useMissionUrlHash() {
  const selectedMissionId = useMissionStore((s) => s.selectedMissionId)
  const selectMission = useMissionStore((s) => s.selectMission)
  const initialised = useRef(false)

  // Read on mount.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('mission')
    if (param && getMissionById(param) && param !== useMissionStore.getState().selectedMissionId) {
      selectMission(param)
    }
    initialised.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Write on change.
  useEffect(() => {
    if (!initialised.current || !selectedMissionId) return
    const url = new URL(window.location.href)
    if (url.searchParams.get('mission') !== selectedMissionId) {
      url.searchParams.set('mission', selectedMissionId)
      window.history.replaceState({}, '', url)
    }
  }, [selectedMissionId])
}
