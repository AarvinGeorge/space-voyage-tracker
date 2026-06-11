/**
 * mission-hud-adapter — resolves a mission's MissionHudPacket at a scrubber
 * position (v1.4 G1). Exports: getHudDataForMission().
 * Why: the 5 generalized HUD components are presentational; this is the ONE
 * place runtime state (scrubberT, live HORIZONS) meets the build-time packets.
 */
import type { MissionHudPacket, HudMetric } from '@/data/types'
import type { StateVector } from '@/store/missionStore'
import { LAST, LAUNCH_N } from '@/data/missionCurve'
import { HUD_PACKETS } from '@/data/missions/hud'
import trajectoryData from '@/data/trajectory.json'

// Mean Earth radius (km) — same constant the packet drafts used for ALTITUDE,
// so adapter-derived and curated baselines stay consistent.
const EARTH_RADIUS_KM = 6371

// The Artemis II OEM trajectory: real geocentric EME2000 state vectors in km,
// the only committed trajectory with physical units (the other 24 are stylized
// scene-space archetypes — see the v1.4 decision below).
const OEM: StateVector[] = trajectoryData

/**
 * Telemetry metric values derived from a physical state vector, keyed by the
 * metric labels used in the hand-curated packets. Critical: only labels listed
 * here are recomputed; anything else (PERIOD, APOGEE, fixed ranges) passes
 * through from the packet untouched.
 */
function deriveMetrics(baseline: HudMetric[], vec: StateVector): HudMetric[] {
  const r = Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2)
  const v = Math.sqrt(vec.vx ** 2 + vec.vy ** 2 + vec.vz ** 2)
  const derived: Record<string, string> = {
    'DIST. EARTH': `${Math.round(r).toLocaleString()} km`,
    VELOCITY: `${v.toFixed(2)} km/s`,
    // why: max(0, …) — during the prepended launch arc |r| sits at the surface
    // and float noise must not render a negative altitude
    ALTITUDE: `${Math.max(0, Math.round(r - EARTH_RADIUS_KM)).toLocaleString()} km`,
  }
  return baseline.map((m) => (derived[m.label] ? { ...m, value: derived[m.label] } : m))
}

/**
 * Resolve the HUD packet for a mission at a scrubber position.
 *
 * Artemis II: metrics derive from the live HORIZONS state vector when one is
 * provided (sourceLabel LIVE HORIZONS, status LIVE), else from the committed
 * OEM trajectory sampled at scrubberT (sourceLabel TRAJECTORY-DERIVED).
 *
 * The other 24 missions return their hand-curated baseline metrics unchanged.
 * v1.4 decision (locked with founder, 2026-06-10): their committed trajectories
 * are stylized scene-space archetypes, so per-scrubber physical telemetry
 * cannot be honestly derived from them — inverting the scene compression gives
 * order-of-magnitude-wrong numbers. STATUS / PHASE / MET still track the
 * scrubber via the identity + elapsed slices; per-scrubber metric derivation
 * for the 24 ships with the v1.5 HUD packet pipeline.
 */
export function getHudDataForMission(
  missionId: string,
  scrubberT: number,
  liveData?: StateVector,
): MissionHudPacket {
  const packet = HUD_PACKETS[missionId]
  if (!packet) {
    // why: throw, not fallback — a missing packet is a build-time data bug
    // (filename = mission id is the Phase 2 contract) and must surface loudly
    throw new Error(`mission-hud-adapter: no HUD packet for mission "${missionId}"`)
  }

  if (missionId !== 'artemis-2') {
    return {
      ...packet,
      telemetry: { ...packet.telemetry, sourceLabel: 'TRAJECTORY-DERIVED' },
    }
  }

  if (liveData) {
    return {
      ...packet,
      telemetry: {
        metrics: deriveMetrics(packet.telemetry.metrics, liveData),
        status: 'LIVE', // v0 TelemetryStrip vocabulary for live HORIZONS data
        sourceLabel: 'LIVE HORIZONS',
      },
    }
  }

  // No live vector: sample the planned OEM path at the scrubber position.
  // why: this mirrors the store's tToArtemisIdx timeline mapping (inlined so the
  // adapter has no runtime store dependency); negative indices are the prepended
  // launch arc, which has no OEM state — clamp those to OEM[0]
  const t = Math.min(1, Math.max(0, scrubberT))
  const idx = Math.min(OEM.length - 1, Math.max(0, Math.round(t * (LAST + LAUNCH_N) - LAUNCH_N)))
  return {
    ...packet,
    telemetry: {
      metrics: deriveMetrics(packet.telemetry.metrics, OEM[idx]),
      status: packet.telemetry.status, // PROJECTED baseline from the packet
      sourceLabel: 'TRAJECTORY-DERIVED',
    },
  }
}
