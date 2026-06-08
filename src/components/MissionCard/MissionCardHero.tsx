import { useState } from 'react'
import type { Mission } from '@/data/types'

// 16:9 hero image, edge-blurred at the bottom into the card surface. Falls back
// to a clean monogram panel if the build-time image hasn't been generated yet.
export default function MissionCardHero({ mission }: { mission: Mission }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-grey-2">
      {!failed ? (
        <img
          src={mission.heroImageUrl}
          alt={mission.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-grey-2 to-black">
          <span className="px-6 text-center font-heading-mono text-[13px] tracking-[0.14em] text-text-muted">
            {mission.name.toUpperCase()}
          </span>
        </div>
      )}
      {/* bottom blur/fade into the card body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
    </div>
  )
}
