/**
 * Build-time HUD packet registry: the 25 hand-curated JSON packets (v1.4 G1).
 * Exports: HUD_PACKETS — mission id → MissionHudPacket.
 * Why: the generalized HUD components are props-driven; this map is the single
 * build-time source the mission-hud-adapter resolves a mission's packet from.
 */
import type { CameraMode, HudTelemetrySource, MissionHudPacket } from '../../types'

import apollo11 from './apollo-11.json'
import artemis2 from './artemis-2.json'
import cassini from './cassini.json'
import chandrayaan3 from './chandrayaan-3.json'
import change6 from './change-6.json'
import crewDragonDemo2 from './crew-dragon-demo-2.json'
import curiosity from './curiosity.json'
import falcon1Flight4 from './falcon-1-flight-4.json'
import falconHeavyStarman from './falcon-heavy-starman.json'
import hayabusa2 from './hayabusa-2.json'
import hubble from './hubble.json'
import inspiration4 from './inspiration4.json'
import iss from './iss.json'
import jwst from './jwst.json'
import marsPathfinder from './mars-pathfinder.json'
import newHorizons from './new-horizons.json'
import newShepardNs15 from './new-shepard-ns15.json'
import perseverance from './perseverance.json'
import rosetta from './rosetta.json'
import sputnik1 from './sputnik-1.json'
import starshipIft3 from './starship-ift-3.json'
import tianwen1 from './tianwen-1.json'
import vostok1 from './vostok-1.json'
import voyager1 from './voyager-1.json'
import voyager2 from './voyager-2.json'

// TypeScript widens JSON string literals to `string` (microsoft/TypeScript#32063),
// so the two union-typed fields (telemetry.sourceLabel, hardware.cameraModes)
// cannot be compile-checked directly from JSON imports. JsonHudPacket preserves
// full compile-time structural validation for every other field; the two unions
// are narrowed by narrowPacket(), which throws at module init naming the packet
// and field, so a bad value fails the dev server / smoke test, never renders.
type JsonHudPacket = Omit<MissionHudPacket, 'telemetry' | 'hardware'> & {
  telemetry: Omit<MissionHudPacket['telemetry'], 'sourceLabel'> & { sourceLabel: string }
  hardware: Omit<MissionHudPacket['hardware'], 'cameraModes'> & { cameraModes: string[] }
}

const CAMERA_MODES: readonly CameraMode[] = ['PERSPECTIVE', 'TOP_DOWN', 'FREE', 'SHIP_FOLLOW']
const SOURCE_LABELS: readonly HudTelemetrySource[] = ['LIVE HORIZONS', 'TRAJECTORY-DERIVED']

/**
 * Narrows a JSON-imported packet's two union fields to their TypeScript unions.
 * Critical: this is the Phase 2 validation gate for values the compiler cannot
 * see through JSON imports — it must throw, not warn, on vocabulary drift.
 */
function narrowPacket(id: string, packet: JsonHudPacket): MissionHudPacket {
  if (!SOURCE_LABELS.includes(packet.telemetry.sourceLabel as HudTelemetrySource)) {
    throw new Error(
      `HUD packet "${id}": invalid telemetry.sourceLabel "${packet.telemetry.sourceLabel}"`,
    )
  }
  for (const mode of packet.hardware.cameraModes) {
    if (!CAMERA_MODES.includes(mode as CameraMode)) {
      throw new Error(`HUD packet "${id}": invalid hardware.cameraModes entry "${mode}"`)
    }
  }
  return packet as MissionHudPacket
}

// why: keys must equal mission ids exactly — the Phase 2 contract is filename = id,
// and the adapter looks packets up by mission.id with no fallback.
const RAW_PACKETS: Record<string, JsonHudPacket> = {
  'apollo-11': apollo11,
  'voyager-1': voyager1,
  'voyager-2': voyager2,
  hubble: hubble,
  'mars-pathfinder': marsPathfinder,
  cassini: cassini,
  iss: iss,
  'new-horizons': newHorizons,
  curiosity: curiosity,
  perseverance: perseverance,
  jwst: jwst,
  'artemis-2': artemis2,
  'sputnik-1': sputnik1,
  'vostok-1': vostok1,
  rosetta: rosetta,
  'hayabusa-2': hayabusa2,
  'chandrayaan-3': chandrayaan3,
  'tianwen-1': tianwen1,
  'change-6': change6,
  'falcon-1-flight-4': falcon1Flight4,
  'falcon-heavy-starman': falconHeavyStarman,
  'crew-dragon-demo-2': crewDragonDemo2,
  'starship-ift-3': starshipIft3,
  'new-shepard-ns15': newShepardNs15,
  inspiration4: inspiration4,
}

export const HUD_PACKETS: Record<string, MissionHudPacket> = Object.fromEntries(
  Object.entries(RAW_PACKETS).map(([id, packet]) => [id, narrowPacket(id, packet)]),
)
