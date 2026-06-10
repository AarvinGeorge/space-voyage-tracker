// ─────────────────────────────────────────────────────────────────────────
// useMissionCamera — unified camera-mode state for any mission (v1.4 G2)
//
// What: resolves a mission's available camera modes + current/set behind ONE
//   CameraMode vocabulary, bridging the two v0 systems.
// Exports: useMissionCamera(mission, config?) → { currentMode, setMode, availableModes }.
// Why: v0 had two parallel camera-mode stores — Artemis' bespoke
//   cameraMode ('reset'|'topdown'|'ship'|'free') and the other 24's
//   hudCameraMode ('PERSPECTIVE'|'TOP_DOWN'|'FREE'). This hook is the single
//   abstraction the unified MissionCameraRig + CameraChip consume in Phase 6.
//   It is intentionally NOT mounted in Phase 1, so rendering is unchanged; it
//   only reads/writes existing store fields (no store edits) as a foundation.
// ─────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo } from 'react'
import type { CameraMode, Mission } from '@/data/types'
import { useMissionStore } from '@/store/missionStore'
import { getArchetypeConfig, type ArchetypeConfig } from '@/lib/archetypes'

// v0 Artemis camera-mode union (missionStore.cameraMode). Kept local to the
// bridge so the rest of v1.4 speaks only in CameraMode.
type V0CameraMode = 'topdown' | 'reset' | 'ship' | 'free'

// Artemis runs the bespoke v0 CameraController; the other 24 run CameraRig off
// hudCameraMode. NASA_OEM_FILE is the archetype that flags the Artemis path.
function usesArtemisRig(mission: Mission): boolean {
  return mission.trajectoryArchetype === 'NASA_OEM_FILE'
}

// CameraMode ⇄ v0 cameraMode (Artemis only). PERSPECTIVE maps to 'reset' — the
// v0 angled hero view (PERSP_CAM_POS) that 'reset' animates toward.
const V0_TO_UNIFIED: Record<V0CameraMode, CameraMode> = {
  reset: 'PERSPECTIVE',
  topdown: 'TOP_DOWN',
  ship: 'SHIP_FOLLOW',
  free: 'FREE',
}
const UNIFIED_TO_V0: Record<CameraMode, V0CameraMode> = {
  PERSPECTIVE: 'reset',
  TOP_DOWN: 'topdown',
  SHIP_FOLLOW: 'ship',
  FREE: 'free',
}

export type UseMissionCamera = {
  currentMode: CameraMode
  setMode: (mode: CameraMode) => void
  availableModes: CameraMode[]
}

/**
 * Camera-mode state for `mission`. `config` defaults to the mission's archetype
 * config; pass it explicitly to avoid a duplicate lookup when the caller already
 * has it. The returned `currentMode` tracks whichever store field backs this
 * mission today, so the hook is correct for both Artemis and the other 24.
 */
export function useMissionCamera(
  mission: Mission,
  config: ArchetypeConfig = getArchetypeConfig(mission.trajectoryArchetype),
): UseMissionCamera {
  const isArtemis = usesArtemisRig(mission)

  // Subscribe to BOTH backing fields; only one is authoritative per mission, but
  // selecting both keeps the hook reactive whichever path renders.
  const v0Mode = useMissionStore((s) => s.cameraMode)
  const hudMode = useMissionStore((s) => s.hudCameraMode)

  const availableModes = useMemo(() => config.cameraModes, [config])

  const currentMode: CameraMode = isArtemis
    ? V0_TO_UNIFIED[v0Mode]
    : // hudCameraMode is already a CameraMode subset (3 shared values).
      (hudMode as CameraMode)

  const setMode = useCallback(
    (mode: CameraMode) => {
      // Guard: never set a mode the mission doesn't expose (e.g. SHIP_FOLLOW on
      // a historical mission). availableModes is the source of truth.
      if (!availableModes.includes(mode)) return
      if (isArtemis) {
        // Drives the v0 CameraController via the existing setter.
        useMissionStore.getState().setCameraMode(UNIFIED_TO_V0[mode])
      } else {
        // The 24 read hudCameraMode; write it directly (no store edit needed —
        // Phase 6 will fold this into a single store action).
        useMissionStore.setState({ hudCameraMode: mode as 'PERSPECTIVE' | 'TOP_DOWN' | 'FREE' })
      }
    },
    [availableModes, isArtemis],
  )

  return { currentMode, setMode, availableModes }
}
