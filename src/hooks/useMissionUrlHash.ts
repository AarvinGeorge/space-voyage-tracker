import { useEffect } from 'react'
import { useMissionStore } from '@/store/missionStore'
import { getMissionById } from '@/data/missionsList'

// Keeps the URL (?mission=apollo-11) in sync with selectedMissionId. The initial
// mission is read synchronously at store init (see missionStore), so this hook
// only WRITES on change and handles browser back/forward (popstate). PRD F6.
export function useMissionUrlHash() {
  const selectedMissionId = useMissionStore((s) => s.selectedMissionId)

  // Write on change (replaceState — no reload).
  useEffect(() => {
    if (!selectedMissionId) return
    const url = new URL(window.location.href)
    if (url.searchParams.get('mission') !== selectedMissionId) {
      url.searchParams.set('mission', selectedMissionId)
      window.history.replaceState({}, '', url)
    }
  }, [selectedMissionId])

  // Back/forward navigation → re-select from the URL.
  useEffect(() => {
    const onPop = () => {
      const param = new URLSearchParams(window.location.search).get('mission')
      if (param && getMissionById(param)) useMissionStore.getState().selectMission(param)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
}
