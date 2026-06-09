import type { AgencyCode, Mission, MissionStatus } from './types'
import { MISSIONS } from './missions'
import { resolveStatus } from '@/lib/resolveStatus'

// Total curated mission count (sidebar header · N).
export const MISSION_COUNT = MISSIONS.length

// Sidebar agency order — by mission count, per PRD §4 (Sidebar).
export const AGENCY_ORDER: AgencyCode[] = [
  'NASA',
  'SPACEX',
  'CNSA',
  'ROSCOSMOS',
  'ESA',
  'JAXA',
  'ISRO',
  'BLUE_ORIGIN',
  'INSPIRATION4',
]

// Display labels for agency group headers (uppercase, mono).
export const AGENCY_LABELS: Record<AgencyCode, string> = {
  NASA: 'NASA',
  SPACEX: 'SPACEX',
  CNSA: 'CNSA',
  ROSCOSMOS: 'ROSCOSMOS',
  ESA: 'ESA',
  JAXA: 'JAXA',
  ISRO: 'ISRO',
  BLUE_ORIGIN: 'BLUE ORIGIN',
  INSPIRATION4: 'INSPIRATION4',
}

// Agency groups that default to expanded in the sidebar (PRD F1: first 3).
export const DEFAULT_EXPANDED_AGENCIES: AgencyCode[] = ['NASA', 'SPACEX', 'CNSA']

export function getMissionById(id: string | null | undefined): Mission | undefined {
  if (!id) return undefined
  return MISSIONS.find((m) => m.id === id)
}

export type AgencyGroup = { agency: AgencyCode; label: string; missions: Mission[] }

// Missions grouped by agency, in AGENCY_ORDER. Within a group, launch order.
export function getMissionsByAgency(): AgencyGroup[] {
  return AGENCY_ORDER.map((agency) => ({
    agency,
    label: AGENCY_LABELS[agency],
    missions: MISSIONS.filter((m) => m.agencyCode === agency).sort(
      (a, b) => +new Date(a.launchDate) - +new Date(b.launchDate),
    ),
  })).filter((g) => g.missions.length > 0)
}

export function getMissionsByDestination(): Record<string, Mission[]> {
  return MISSIONS.reduce<Record<string, Mission[]>>((acc, m) => {
    ;(acc[m.destination] ??= []).push(m)
    return acc
  }, {})
}

// Data-driven status — UI never hardcodes status (PRD F2.0).
export function getStatus(mission: Mission, now?: number): MissionStatus {
  return resolveStatus(mission, now)
}

export { MISSIONS }
