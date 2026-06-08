// ─────────────────────────────────────────────────────────────────────────
// Mission data model — Space Voyage Tracker v1
//
// Schema per _mission_curation_2026-06-07.md. NOTE (PRD F2.0): mission.status
// is NEVER hardcoded. The record carries resolution *inputs* only; the status
// is derived at build time / render time by resolveStatus() in
// src/lib/resolveStatus.ts. UI renders whatever the resolver returns.
// ─────────────────────────────────────────────────────────────────────────

export type AgencyCode =
  | 'NASA'
  | 'ROSCOSMOS'
  | 'ESA'
  | 'JAXA'
  | 'ISRO'
  | 'CNSA'
  | 'SPACEX'
  | 'BLUE_ORIGIN'
  | 'INSPIRATION4'

export type MissionStatus = 'SUCCESS' | 'PARTIAL' | 'FAILURE' | 'ONGOING'

export type ViewMode = 'EARTH_SYSTEM' | 'HELIOCENTRIC'

export type TrajectoryType =
  | 'LEO_CIRCULAR'
  | 'TRANS_LUNAR'
  | 'LUNAR_ORBIT'
  | 'LUNAR_LANDING'
  | 'HOHMANN_MARS'
  | 'HOHMANN_VENUS'
  | 'GRAVITY_ASSIST_OUTER'
  | 'HYPERBOLIC_ESCAPE'
  | 'INTERSTELLAR'
  | 'BALLISTIC_SUBORBITAL'
  | 'L2_HALO'
  | 'COMET_RENDEZVOUS'
  | 'ASTEROID_RENDEZVOUS'
  | 'NASA_OEM_FILE' // Artemis II only — references the existing trajectory.json

export type MilestoneEvent = {
  t: number // normalized 0-1 position within mission duration
  label: string // short uppercase label, <= 8 chars (e.g. "LAUNCH", "TLI", "LOI")
  utc?: string // optional ISO timestamp for hover detail
}

export type KeyFact = { label: string; value: string }

// Mission-specific endpoint body required as a trajectory destination.
export type EndpointBody = 'TITAN' | 'COMET_67P' | 'RYUGU'

export type PlanetKey =
  | 'MERCURY'
  | 'VENUS'
  | 'EARTH'
  | 'MARS'
  | 'JUPITER'
  | 'SATURN'
  | 'URANUS'
  | 'NEPTUNE'
  | 'PLUTO'

export type Mission = {
  id: string // slug, e.g. "apollo-11"
  name: string // "Apollo 11"
  agency: string // "NASA"
  agencyCode: AgencyCode
  country: string // "United States"
  launchDate: string // "1969-07-16" ISO date

  // ── Status resolution inputs (NOT the status itself) ──
  primaryEndDate: string | null // ISO date primary phase completed; null if open-ended / not yet done
  partialOutcome: boolean // manual flag — partial success (e.g. Starship IFT-3)
  failureOutcome: boolean // manual flag — failure before primary objectives
  horizonsBodyCode: string | null // NAIF body code for HORIZONS query, or null
  livelyTracked: boolean // populated at build time: HORIZONS returns current state vectors

  destination: string // "Moon"
  viewMode: ViewMode // EARTH_SYSTEM | HELIOCENTRIC (auto-fit on selection)
  trajectoryArchetype: TrajectoryType
  crewed: boolean
  crewCount: number // 0 if uncrewed

  // Heliocentric trajectory hints (used by archetype generators)
  flybyPlanets?: PlanetKey[] // ordered gravity-assist / flyby planets
  endpointBody?: EndpointBody // fades in when this mission is selected

  heroImageUrl: string // local path: /missions/apollo-11.webp
  heroImageCredit: string // attribution string
  summaryPath: string // local path: /data/missions/summaries/apollo-11.md

  keyFacts: KeyFact[] // extra facts beyond the 4-fact strip (Distance · Duration · Notable…)
  milestoneEvents: MilestoneEvent[] // drives the MissionTimeline phase markers
  totalDuration: number // mission duration in seconds (drives timestamp format)
  defaultSpeed: 1 | 2 | 5 | 10 | 50 // initial scrubber playback speed
}
