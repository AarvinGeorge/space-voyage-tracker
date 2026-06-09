import { useMissionStore } from '@/store/missionStore'
import { getMissionById } from '@/data/missionsList'
import type { TrajectoryType } from '@/data/types'

// v1.2 H3: mode chip, top-left. Shows the active view mode + the trajectory kind,
// e.g. "EARTH SYSTEM · LUNAR LANDING" or "HELIOCENTRIC · INTERSTELLAR".
const ARCHETYPE_LABEL: Record<TrajectoryType, string> = {
  LEO_CIRCULAR: 'LOW EARTH ORBIT',
  TRANS_LUNAR: 'LUNAR FLYBY',
  LUNAR_ORBIT: 'LUNAR ORBIT',
  LUNAR_LANDING: 'LUNAR LANDING',
  HOHMANN_MARS: 'MARS TRANSFER',
  HOHMANN_VENUS: 'VENUS TRANSFER',
  GRAVITY_ASSIST_OUTER: 'GRAVITY ASSIST',
  HYPERBOLIC_ESCAPE: 'ESCAPE TRAJECTORY',
  INTERSTELLAR: 'INTERSTELLAR',
  BALLISTIC_SUBORBITAL: 'SUBORBITAL',
  L2_HALO: 'L2 HALO ORBIT',
  COMET_RENDEZVOUS: 'COMET RENDEZVOUS',
  ASTEROID_RENDEZVOUS: 'ASTEROID RENDEZVOUS',
  NASA_OEM_FILE: 'LUNAR FREE-RETURN',
}

const CHIP =
  'pointer-events-none absolute z-10 rounded-sm border border-border bg-surface/90 px-2 py-1 font-caption-mono text-[10px] tracking-[0.1em] text-text-secondary'

export default function ModeChip() {
  const viewMode = useMissionStore((s) => s.viewMode)
  const selectedMissionId = useMissionStore((s) => s.selectedMissionId)
  const mission = getMissionById(selectedMissionId)
  if (!mission) return null

  const modeLabel = viewMode === 'HELIOCENTRIC' ? 'HELIOCENTRIC' : 'EARTH SYSTEM'
  const archLabel = ARCHETYPE_LABEL[mission.trajectoryArchetype]

  return (
    <div className={`${CHIP} left-4 top-4`}>
      {modeLabel} · {archLabel}
    </div>
  )
}
