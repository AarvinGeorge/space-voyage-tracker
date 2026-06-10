// ─────────────────────────────────────────────────────────────────────────
// Per-archetype scene + camera configuration — Space Voyage Tracker v1.4 (G2)
//
// What: one ArchetypeConfig per TrajectoryType (scene framing, camera modes +
//   default, spacecraft glyph scale, celestial bodies, range rings).
// Exports: ARCHETYPE_CONFIG, getArchetypeConfig(), HELIO_FRAMING,
//   ARTEMIS_RANGE_RINGS, CelestialBody.
// Why: in v0 these values were scattered across SceneCanvas / CameraRig /
//   TrajectoryArchetype / SolarSystem with per-component switch statements.
//   v1.4 collects them so the unified MissionCameraRig (Phase 6) and the HUD
//   adapter read ONE source of truth. Values are transcribed verbatim from the
//   shipping v0 code (cited inline) so this is non-behavioural until consumed.
//   Stays TypeScript for v1.4; JSON migration with a Zod loader is v1.5.
// ─────────────────────────────────────────────────────────────────────────

import type { CameraMode, TrajectoryType } from '@/data/types'

// Celestial bodies a scene can show. Descriptive (drives no render yet in v1.4
// Phase 1) — kept faithful to SolarSystem.tsx + the Artemis v0 scene so later
// phases can dispatch per-archetype instead of per-component branches.
export type CelestialBody =
  | 'EARTH'
  | 'MOON'
  | 'SUN'
  | 'PLANETS' // Mercury…Neptune (the heliocentric planet set)
  | 'ASTEROID_BELT'
  | 'KARMAN_LINE'
  | 'L2_MARKER'
  | 'ENDPOINT' // mission-specific body (Titan / 67P / Ryugu) when present

// Earth-system camera framing: distance = max(bboxSize * sizeMul, floor).
// Transcribed from CameraRig.tsx (v1.2 D3 per-archetype defaults).
export type SceneScale = { sizeMul: number; floor: number }

export type ArchetypeConfig = {
  sceneScale: SceneScale // earth-system framing; heliocentric uses HELIO_FRAMING
  cameraDefaultMode: CameraMode // resting mode on selection (PERSPECTIVE everywhere in v0)
  cameraModes: CameraMode[] // modes this archetype exposes (3 base; +SHIP_FOLLOW for Artemis)
  glyphScale: number // spacecraft chevron scale (v1.2 D4 — glyphScaleFor in TrajectoryArchetype)
  celestialBodies: CelestialBody[] // native scene bodies for this archetype
  rangeRings: string[] // ring labels; empty except the lunar Artemis set
}

// Shared heliocentric framing — CameraRig.tsx: clamp(size * 1.05, 95, 300). Used
// by every mission while the HELIOCENTRIC view is active (the Sun anchors the
// frame), regardless of archetype, so it lives outside the per-archetype map.
export const HELIO_FRAMING = { sizeMul: 1.05, min: 95, max: 300 } as const

// The Artemis II range-ring set (SceneCanvas RangeRings). Lunar archetypes inherit
// it per PRD v1.4 §0 G2 / handoff 1b. Order matches the v0 ringsData array.
export const ARTEMIS_RANGE_RINGS = [
  'LEO BOUNDARY',
  'VAN ALLEN BELTS',
  'LUNAR SOI',
  'APOLLO 13 RECORD',
  'MOON ORBIT',
] as const

// Base camera modes available to every mission (the unified PERSPECTIVE/TOP_DOWN/
// FREE set the v0 CameraChip already drove for the 24 non-Artemis missions).
const BASE_CAMERA_MODES: CameraMode[] = ['PERSPECTIVE', 'TOP_DOWN', 'FREE']
// Artemis II adds SHIP_FOLLOW (live state vectors make a ship-locked camera real).
const ARTEMIS_CAMERA_MODES: CameraMode[] = [...BASE_CAMERA_MODES, 'SHIP_FOLLOW']

// Default scene framing reused by the heliocentric archetypes (CameraRig default
// branch: max(size * 1.15, 18)). The Sun-anchored HELIO_FRAMING applies whenever
// they are viewed heliocentrically; this floor governs an earth-system toggle.
const HELIO_ARCHETYPE_SCALE: SceneScale = { sizeMul: 1.15, floor: 18 }

export const ARCHETYPE_CONFIG: Record<TrajectoryType, ArchetypeConfig> = {
  // ── Earth-system archetypes ──
  LEO_CIRCULAR: {
    sceneScale: { sizeMul: 2.2, floor: 20 }, // CameraRig LEO_CIRCULAR
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 2.0, // glyphScaleFor default branch
    celestialBodies: ['EARTH'],
    rangeRings: [],
  },
  TRANS_LUNAR: {
    sceneScale: { sizeMul: 0.95, floor: 55 }, // CameraRig lunar group
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 2.0,
    celestialBodies: ['EARTH', 'MOON'],
    rangeRings: [...ARTEMIS_RANGE_RINGS], // inherits Artemis set (handoff 1b)
  },
  LUNAR_ORBIT: {
    sceneScale: { sizeMul: 0.95, floor: 55 },
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 2.0,
    celestialBodies: ['EARTH', 'MOON'],
    rangeRings: [], // handoff 1b names only TRANS_LUNAR + LUNAR_LANDING
  },
  LUNAR_LANDING: {
    sceneScale: { sizeMul: 0.95, floor: 55 },
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 2.0,
    celestialBodies: ['EARTH', 'MOON'],
    rangeRings: [...ARTEMIS_RANGE_RINGS], // inherits Artemis set (handoff 1b)
  },
  BALLISTIC_SUBORBITAL: {
    sceneScale: { sizeMul: 1.6, floor: 20 }, // CameraRig BALLISTIC_SUBORBITAL
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 1.5, // glyphScaleFor BALLISTIC_SUBORBITAL
    celestialBodies: ['EARTH', 'KARMAN_LINE'],
    rangeRings: [],
  },
  L2_HALO: {
    sceneScale: { sizeMul: 1.05, floor: 80 }, // CameraRig L2_HALO
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 2.0, // glyphScaleFor default branch
    celestialBodies: ['EARTH', 'L2_MARKER'],
    rangeRings: [],
  },

  // ── Heliocentric archetypes (HELIO_FRAMING applies in the Sun-anchored view) ──
  HOHMANN_MARS: {
    sceneScale: HELIO_ARCHETYPE_SCALE,
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 2.5, // glyphScaleFor inner-solar-system
    celestialBodies: ['SUN', 'PLANETS', 'ASTEROID_BELT'],
    rangeRings: [],
  },
  HOHMANN_VENUS: {
    sceneScale: HELIO_ARCHETYPE_SCALE,
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 2.5,
    celestialBodies: ['SUN', 'PLANETS', 'ASTEROID_BELT'],
    rangeRings: [],
  },
  GRAVITY_ASSIST_OUTER: {
    sceneScale: HELIO_ARCHETYPE_SCALE,
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 1.0, // glyphScaleFor outer-heliocentric
    celestialBodies: ['SUN', 'PLANETS', 'ASTEROID_BELT', 'ENDPOINT'],
    rangeRings: [],
  },
  HYPERBOLIC_ESCAPE: {
    sceneScale: HELIO_ARCHETYPE_SCALE,
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 1.0,
    celestialBodies: ['SUN', 'PLANETS', 'ASTEROID_BELT'],
    rangeRings: [],
  },
  INTERSTELLAR: {
    sceneScale: HELIO_ARCHETYPE_SCALE,
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 1.0,
    celestialBodies: ['SUN', 'PLANETS', 'ASTEROID_BELT'],
    rangeRings: [],
  },
  COMET_RENDEZVOUS: {
    sceneScale: HELIO_ARCHETYPE_SCALE,
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 1.0,
    celestialBodies: ['SUN', 'PLANETS', 'ASTEROID_BELT', 'ENDPOINT'],
    rangeRings: [],
  },
  ASTEROID_RENDEZVOUS: {
    sceneScale: HELIO_ARCHETYPE_SCALE,
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: BASE_CAMERA_MODES,
    glyphScale: 1.0,
    celestialBodies: ['SUN', 'PLANETS', 'ASTEROID_BELT', 'ENDPOINT'],
    rangeRings: [],
  },

  // ── Artemis II — the v0 OEM scene (Earth + Moon + range rings + OrionModel) ──
  NASA_OEM_FILE: {
    // Artemis keeps its bespoke v0 CameraController framing (TRAJ_CENTER-based),
    // not CameraRig's size formula; these values mirror the lunar group so a
    // future unified rig frames it comparably. Floor 55 ≈ tight Earth-Moon.
    sceneScale: { sizeMul: 0.95, floor: 55 },
    cameraDefaultMode: 'PERSPECTIVE',
    cameraModes: ARTEMIS_CAMERA_MODES, // the only archetype offering SHIP_FOLLOW
    glyphScale: 2.0, // OrionModel carries its own internal scale in v0; lunar-equivalent here
    celestialBodies: ['EARTH', 'MOON', 'SUN'], // v0 scene renders Sun + Earth + Moon
    rangeRings: [...ARTEMIS_RANGE_RINGS], // origin of the set (v0 RangeRings renders these)
  },
}

// Resolve the config for a mission's archetype. Total over TrajectoryType, so the
// lookup is always defined — no fallback needed.
export function getArchetypeConfig(archetype: TrajectoryType): ArchetypeConfig {
  return ARCHETYPE_CONFIG[archetype]
}
