// Page footer (PRD §4 · non-negotiable #10). The trajectory disclosure text is
// LOCKED and must read exactly as below.
export default function PageFooter() {
  return (
    <footer className="flex h-8 w-full shrink-0 items-center justify-between gap-4 overflow-hidden border-t border-border bg-background px-4">
      <span className="truncate font-caption-mono text-[0.625rem] tracking-[0.1em] text-text-muted">
        TRAJECTORIES: 13 REAL JPL HORIZONS · 6 PUBLISHED-REPORT ASSEMBLY · 5 ARCHETYPE · ARTEMIS II OEM.
        ALL STORED AT BUILD TIME. ZERO RUNTIME API CALLS.
      </span>
      <span className="hidden shrink-0 font-caption-mono text-[0.625rem] tracking-[0.1em] text-text-muted lg:inline">
        BUILT FOR FOUNDERS INC OFF SEASON II · 2026 · AARVIN GEORGE
      </span>
    </footer>
  )
}
