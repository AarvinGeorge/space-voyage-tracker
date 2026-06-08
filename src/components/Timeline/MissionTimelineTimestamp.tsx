import type { Mission } from '@/data/types'

const FOURTEEN_DAYS = 14 * 86400

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Timestamp display (PRD F8): DAY N — HH:MM UTC for short missions,
// YYYY-MM-DD HH:MM for long missions.
export default function MissionTimelineTimestamp({
  mission,
  t,
}: {
  mission: Mission
  t: number
}) {
  const elapsed = t * mission.totalDuration
  let text: string

  if (mission.totalDuration <= FOURTEEN_DAYS) {
    const day = Math.floor(elapsed / 86400) + 1
    const rem = elapsed % 86400
    const hh = Math.floor(rem / 3600)
    const mm = Math.floor((rem % 3600) / 60)
    text = `DAY ${day} — ${pad(hh)}:${pad(mm)} UTC`
  } else {
    const d = new Date(new Date(mission.launchDate).getTime() + elapsed * 1000)
    text = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(
      d.getUTCHours(),
    )}:${pad(d.getUTCMinutes())}`
  }

  return (
    <span className="font-body-mono text-[9px] tracking-[0.08em] text-text-primary tabular-nums">
      {text}
    </span>
  )
}
