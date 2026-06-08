import type { EndpointBody } from '@/data/types'
import Titan from './Titan'
import Comet67P from './Comet67P'
import AsteroidRyugu from './AsteroidRyugu'

// Container for the mission-specific endpoint bodies. Each fades to opacity 1
// only when its related mission is selected; opacity 0 otherwise.
export default function MissionEndpoints({ active }: { active: EndpointBody | null }) {
  return (
    <group>
      <Titan active={active === 'TITAN'} />
      <Comet67P active={active === 'COMET_67P'} />
      <AsteroidRyugu active={active === 'RYUGU'} />
    </group>
  )
}
