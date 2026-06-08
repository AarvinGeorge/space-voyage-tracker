import type { Mission } from '@/data/types'
import { getSummary } from '@/data/summaries'

// The LLM-generated 250-word summary (Inter prose). Build-time only; if not yet
// generated, shows a graceful note rather than breaking.
export default function MissionCardSummary({ mission }: { mission: Mission }) {
  const summary = getSummary(mission.id)

  if (!summary) {
    return (
      <p className="px-6 pb-4 font-body-prose text-[13px] leading-relaxed text-text-muted">
        Mission summary is generated at build time by the Anthropic Claude SDK and
        committed to the repository. Run <span className="font-body-mono">npm run generate:summaries</span> to
        populate it.
      </p>
    )
  }

  const paragraphs = summary.split(/\n\s*\n/).filter(Boolean)

  return (
    <div className="space-y-3 px-6 pb-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="font-body-prose text-body-prose leading-[1.6] text-text-secondary">
          {p.trim()}
        </p>
      ))}
    </div>
  )
}
