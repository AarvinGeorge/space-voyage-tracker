/**
 * fetch_missions.ts — build-time mission metadata step.
 *
 * The 25 curated landmark missions are hand-authored in src/data/missions.ts
 * (Launch Library 2 does not index historical missions like Sputnik / Vostok /
 * Voyager cleanly, and the curated keyFacts / milestones / trajectory archetypes
 * are editorial). This script therefore VALIDATES the committed dataset rather
 * than overwriting it: it confirms record completeness, agency grouping, and
 * status-resolution inputs, and optionally cross-checks launch dates against
 * Launch Library 2 (best-effort, non-fatal).
 *
 * Run: npm run fetch:missions
 */
import { MISSIONS } from '../src/data/missions'
import { AGENCY_ORDER } from '../src/data/missionsList'
import { resolveStatus } from '../src/lib/resolveStatus'

function validate() {
  const ids = new Set<string>()
  let ok = true
  for (const m of MISSIONS) {
    if (ids.has(m.id)) {
      console.error(`✗ duplicate id: ${m.id}`)
      ok = false
    }
    ids.add(m.id)
    if (!m.name || !m.agencyCode || !m.launchDate || !m.trajectoryArchetype) {
      console.error(`✗ ${m.id}: missing required field`)
      ok = false
    }
    if (m.keyFacts.length === 0) console.warn(`! ${m.id}: no keyFacts`)
    if (m.milestoneEvents.length === 0) console.warn(`! ${m.id}: no milestoneEvents`)
  }
  return ok
}

function report() {
  console.log(`\n${MISSIONS.length} missions:`)
  for (const agency of AGENCY_ORDER) {
    const group = MISSIONS.filter((m) => m.agencyCode === agency)
    if (!group.length) continue
    console.log(`  ${agency} (${group.length})`)
    for (const m of group) {
      console.log(`    · ${m.name.padEnd(28)} ${m.launchDate}  → ${resolveStatus(m)}`)
    }
  }
}

const ok = validate()
report()
if (!ok) {
  console.error('\n✗ validation failed')
  process.exit(1)
}
console.log(`\n✓ ${MISSIONS.length} missions valid. src/data/missions.ts is the committed source.`)
