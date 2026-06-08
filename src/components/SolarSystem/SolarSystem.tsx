import type { Mission } from '@/data/types'
import { EARTH_R, MOON_R, MOON_POS, PLANET_KEYS, PLANETS, helioPos } from '@/lib/solarSystem'
import Planet from './Planet'
import Sun from './Sun'
import AsteroidBelt from './AsteroidBelt'
import MissionEndpoints from './MissionEndpoints'
import L2Marker from './L2Marker'
import KarmanLineRing from './KarmanLineRing'

// The persistent celestial-body layer. Renders the bodies appropriate to the
// active view mode (the two coordinate frames — Earth-at-origin vs Sun-at-origin
// — cannot coexist, so we switch). Not mounted for Artemis II (the v0 scene
// owns Earth/Moon/RangeRings for that mission).
export default function SolarSystem({ mission }: { mission: Mission }) {
  const arch = mission.trajectoryArchetype
  const isLunar = arch === 'TRANS_LUNAR' || arch === 'LUNAR_ORBIT' || arch === 'LUNAR_LANDING'
  const isSuborbital = arch === 'BALLISTIC_SUBORBITAL'
  const isL2 = arch === 'L2_HALO'

  if (mission.viewMode === 'HELIOCENTRIC') {
    return (
      <group>
        <Sun />
        {PLANET_KEYS.map((key) => {
          const p = PLANETS[key]
          const pos = helioPos(key)
          return (
            <Planet
              key={key}
              position={[pos.x, pos.y, pos.z]}
              radius={p.radius}
              color={p.color}
              ring={key === 'SATURN'}
              label={p.name.toUpperCase()}
            />
          )
        })}
        <AsteroidBelt />
        <MissionEndpoints active={mission.endpointBody ?? null} />
      </group>
    )
  }

  // EARTH_SYSTEM
  return (
    <group>
      <Planet position={[0, 0, 0]} radius={EARTH_R} color="#2a6fdb" rotationSpeed={0.04} />
      {isLunar && (
        <Planet
          position={[MOON_POS.x, MOON_POS.y, MOON_POS.z]}
          radius={MOON_R}
          color="#8a8a8a"
          label="MOON"
          rotationSpeed={0.02}
        />
      )}
      <KarmanLineRing active={isSuborbital} />
      <L2Marker active={isL2} />
    </group>
  )
}
