import type { Mission } from '@/data/types'
import { getStatus } from '@/data/missionsList'
import StatusDot from '@/components/shared/StatusDot'

// The 4-fact strip (LAUNCH · DESTINATION · CREW · STATUS), populated entirely
// from mission.* fields, plus a secondary row of curated key facts.
export default function MissionCardFacts({ mission }: { mission: Mission }) {
  const status = getStatus(mission)
  const launch = new Date(mission.launchDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const crew = mission.crewed ? `${mission.crewCount} CREW` : 'UNCREWED'

  const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="font-caption-mono text-[9px] tracking-[0.12em] text-text-muted">{label}</span>
      <span className="truncate font-body-mono text-[11px] tracking-[0.02em] text-text-primary">
        {children}
      </span>
    </div>
  )

  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-4 gap-3 border-b border-border pb-4">
        <Fact label="LAUNCH">{launch}</Fact>
        <Fact label="DESTINATION">{mission.destination}</Fact>
        <Fact label="CREW">{crew}</Fact>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-caption-mono text-[9px] tracking-[0.12em] text-text-muted">STATUS</span>
          <span className="flex items-center gap-1.5 font-body-mono text-[11px] tracking-[0.02em] text-text-primary">
            <StatusDot status={status} />
            {status}
          </span>
        </div>
      </div>
      {mission.keyFacts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {mission.keyFacts.map((f) => (
            <div key={f.label} className="flex flex-col gap-0.5">
              <span className="font-caption-mono text-[9px] tracking-[0.12em] text-text-muted">
                {f.label}
              </span>
              <span className="font-body-mono text-[11px] tracking-[0.02em] text-text-secondary">
                {f.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
