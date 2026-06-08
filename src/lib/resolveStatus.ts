import type { Mission, MissionStatus } from '@/data/types'

// ─────────────────────────────────────────────────────────────────────────
// Build-time / render-time status resolver (PRD F2.0 — LOCKED PRINCIPLE).
//
// mission.status is NEVER hardcoded. It is derived from the resolution inputs
// carried on each Mission record:
//   - failureOutcome / partialOutcome (manual flags)
//   - launchDate / primaryEndDate (dates)
//   - livelyTracked (populated at build time from HORIZONS query results)
//
// The same pure function is used by scripts/fetch_trajectories.ts (build time)
// and by the UI (render time). Identical inputs → identical output.
// ─────────────────────────────────────────────────────────────────────────
export function resolveStatus(
  mission: Pick<
    Mission,
    'failureOutcome' | 'partialOutcome' | 'launchDate' | 'primaryEndDate' | 'livelyTracked'
  >,
  now: number = Date.now(),
): MissionStatus {
  if (mission.failureOutcome) return 'FAILURE'
  if (mission.partialOutcome) return 'PARTIAL'

  const launched = new Date(mission.launchDate).getTime()
  const primaryEnd = mission.primaryEndDate ? new Date(mission.primaryEndDate).getTime() : null

  // Not yet launched — treated as not-yet-relevant (won't appear in v1).
  if (launched > now) return 'SUCCESS'

  // Primary phase ended in the past → completed.
  if (primaryEnd !== null && primaryEnd <= now) return 'SUCCESS'

  // No primary end (or end in future) AND reachable via HORIZONS → truly ongoing.
  if (mission.livelyTracked) return 'ONGOING'

  // Open-ended but no live data → primary phase effectively complete.
  return 'SUCCESS'
}
