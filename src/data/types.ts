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

// ═════════════════════════════════════════════════════════════════════════
// v1.4 — Generalized HUD data model (G1)
//
// What: the typed contract for the per-mission HUD overlay (MissionHUD).
// Exports: CameraMode, MissionHudPacket (+ its 5 slices), MissionRuntimeData.
// Why: in v0 the HUD read Artemis-specific values straight from the store, so
// it only worked for Artemis II. v1.4 makes the 5 HUD components presentational
// — they take a slice of this strict packet as props. Every mission supplies a
// MissionHudPacket (hand-curated JSON in src/data/missions/hud/, resolved at
// runtime by mission-hud-adapter). The packet is the stable frontend contract;
// the data conforms to it. Strict shape = v1.4 ship safety; optional slot-based
// fields can extend it in v1.5 without breaking changes (PRD v1.4 §0).
// ═════════════════════════════════════════════════════════════════════════

// Unified camera-mode vocabulary for the v1.4 MissionCameraRig (G2). Replaces
// the two v0 systems (Artemis' 'reset'|'topdown'|'ship'|'free' + the others'
// 'PERSPECTIVE'|'TOP_DOWN'|'FREE'). SHIP_FOLLOW is offered only for Artemis II,
// where live state vectors make a ship-locked camera meaningful; for historical
// missions it would degenerate into "camera pinned to scrubber" (PRD v1.4 §0 G2).
export type CameraMode = 'PERSPECTIVE' | 'TOP_DOWN' | 'FREE' | 'SHIP_FOLLOW'

// Provenance shown in the telemetry footer. Artemis II blends a live JPL HORIZONS
// state vector ('LIVE HORIZONS'); the other 24 derive metrics from their stored
// trajectory at the scrubber position ('TRAJECTORY-DERIVED'). Set by the adapter.
export type HudTelemetrySource = 'LIVE HORIZONS' | 'TRAJECTORY-DERIVED'

// One metric card in the TelemetryStrip (e.g. { label: 'DIST. EARTH', value: '384,400 km' }).
export type HudMetric = { label: string; value: string }

// One phase in the identity slice. The current phase is the first entry whose
// `untilT` is >= the mission's current normalized time (mirrors v0 getPhase()).
export type HudPhase = { untilT: number; label: string }

// One milestone tick in the timeline slice (generalizes the live Artemis feed to
// a static, build-time list of mission moments for the other 24 missions).
export type HudTimelineEvent = {
  t: number // normalized 0-1 position within the mission
  label: string // short uppercase, e.g. "LAUNCH", "TLI", "LANDING"
  utc?: string // optional ISO timestamp for hover detail
  detail?: string // optional one-line description for hover
}

// MissionIdentity slice — mission display name + ordered phase schedule.
export type HudIdentitySlice = {
  missionName: string // e.g. "Apollo 11" / "Artemis II — Integrity"
  phases: HudPhase[] // ordered; current phase resolved from currentT
}

// MissionElapsed slice — drives the MET clock. Elapsed seconds = currentT *
// durationSeconds; the displayed UTC = launchUtc + elapsed.
export type HudElapsedSlice = {
  launchUtc: string // ISO 8601 launch instant, e.g. "1969-07-16T13:32:00Z"
  durationSeconds: number // full mission duration in seconds
}

// TelemetryStrip slice — the metric cards plus status word and data provenance.
// metrics/status are recomputed per scrubber position by the adapter (the JSON
// carries the t=0 baseline); sourceLabel records where the live values came from.
export type HudTelemetrySlice = {
  metrics: HudMetric[] // ordered metric cards (label + value)
  status: string // e.g. "HISTORIC" | "COMPLETE" | "LIVE" | "PROJECTED"
  sourceLabel: HudTelemetrySource
}

// EventTimeline slice — the mission's milestone events (replaces v0's live news
// feed for the 24 historical missions; Artemis keeps its live feed in EventDrawer).
export type HudTimelineSlice = {
  events: HudTimelineEvent[]
}

// HardwareControls slice — which camera modes this mission exposes (3 for the 24,
// 4 incl SHIP_FOLLOW for Artemis II) and whether the live-feed button is shown.
export type HudHardwareSlice = {
  cameraModes: CameraMode[]
  liveFeed: boolean // Artemis-only EventDrawer trigger (false for the 24)
}

// The full strict HUD packet — one per mission. Slice names match PRD v1.4 §0
// ({ identity, elapsed, telemetry, timeline, hardware }). Hand-curated JSON in
// src/data/missions/hud/<id>.json conforms to this exact shape (validated at
// build time in Phase 2). Do not add Artemis-specific fields here — anything
// live belongs in the adapter, not the static packet.
export type MissionHudPacket = {
  identity: HudIdentitySlice
  elapsed: HudElapsedSlice
  telemetry: HudTelemetrySlice
  timeline: HudTimelineSlice
  hardware: HudHardwareSlice
}

// What flows through the MissionHUD at runtime: the mission record, its resolved
// HUD packet (post-adapter, so telemetry reflects currentT), and the normalized
// scrubber position. The 5 HUD components receive their slice of `hudPacket`
// plus `currentT` — never the store directly (PRD v1.4 §0 G1).
export type MissionRuntimeData = {
  mission: Mission
  hudPacket: MissionHudPacket
  currentT: number // normalized 0-1 scrubber position for the selected mission
}
