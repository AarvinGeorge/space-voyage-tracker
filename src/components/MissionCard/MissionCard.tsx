import { useMemo } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { Minimize2, X } from 'lucide-react'
import { useMissionStore } from '@/store/missionStore'
import { getMissionById } from '@/data/missionsList'
import { useIsMobile } from '@/hooks/useIsMobile'
import MissionCardFull from './MissionCardFull'
import MissionTag from './MissionTag'
import MissionCardHero from './MissionCardHero'
import MissionCardFacts from './MissionCardFacts'
import MissionCardSummary from './MissionCardSummary'
import { ScrollArea } from '@/components/ui/scroll-area'

// Floating mission card — owns the FULL ⇄ TAG → DISMISSED state machine (PRD F4).
// Desktop: free-floating + draggable. Mobile (Frame 7): TAG is a floating chip
// above the timeline by default; FULL is a ~62vh bottom sheet with a drag handle.
export default function MissionCard() {
  const selectedMissionId = useMissionStore((s) => s.selectedMissionId)
  const cardState = useMissionStore((s) => s.cardState)
  const setCardState = useMissionStore((s) => s.setCardState)
  const closeMissionCard = useMissionStore((s) => s.closeMissionCard)
  const isMobile = useIsMobile()
  const dragControls = useDragControls()

  const mission = getMissionById(selectedMissionId)
  const reduceMotion = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  )

  if (!mission || cardState === 'DISMISSED') return null

  const minimize = () => setCardState('TAG')
  const expand = () => setCardState('FULL')
  const year = new Date(mission.launchDate).getUTCFullYear()

  // ── Mobile ──
  if (isMobile) {
    if (cardState === 'TAG') {
      return (
        <div className="pointer-events-none absolute inset-x-0 bottom-[104px] z-30 flex justify-center px-3">
          <motion.div
            className="pointer-events-auto"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <MissionTag mission={mission} onExpand={expand} onClose={closeMissionCard} />
          </motion.div>
        </div>
      )
    }
    // FULL → bottom sheet
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center">
        <motion.div
          className="pointer-events-auto flex h-[62vh] w-full flex-col rounded-t-lg border-t border-border bg-surface shadow-[0_-8px_32px_rgba(0,0,0,0.6)]"
          initial={reduceMotion ? false : { y: '100%' }}
          animate={{ y: 0 }}
          exit={reduceMotion ? undefined : { y: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* drag handle → minimize to tag */}
          <button
            onClick={minimize}
            className="flex w-full shrink-0 justify-center py-2"
            aria-label="Minimize to tag"
          >
            <span className="h-1 w-10 rounded-full bg-border-strong" />
          </button>
          <div className="flex h-10 shrink-0 items-center gap-2 px-4">
            <span className="rounded-sm border border-border px-1.5 py-0.5 font-caption-mono text-[9px] tracking-[0.1em] text-text-secondary">
              {mission.agency.toUpperCase()}
            </span>
            <span className="flex-1 truncate font-heading-mono text-[13px] font-medium tracking-[0.06em] text-text-primary">
              {mission.name.toUpperCase()}
            </span>
            <span className="font-body-mono text-[11px] text-text-muted">{year}</span>
            <button onClick={minimize} aria-label="Minimize" className="text-text-secondary hover:text-text-primary">
              <Minimize2 size={15} />
            </button>
            <button onClick={closeMissionCard} aria-label="Close" className="text-text-secondary hover:text-live-red">
              <X size={16} />
            </button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <MissionCardHero mission={mission} />
            <MissionCardFacts mission={mission} />
            <MissionCardSummary mission={mission} />
          </ScrollArea>
        </motion.div>
      </div>
    )
  }

  // ── Desktop: free-floating + draggable ──
  const startDrag = (e: React.PointerEvent) => dragControls.start(e)
  const child =
    cardState === 'FULL' ? (
      <MissionCardFull
        mission={mission}
        onHeaderPointerDown={startDrag}
        onMinimize={minimize}
        onClose={closeMissionCard}
      />
    ) : (
      <MissionTag mission={mission} onHeaderPointerDown={startDrag} onExpand={expand} onClose={closeMissionCard} />
    )

  return (
    <motion.div
      key={selectedMissionId}
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      className="pointer-events-auto absolute right-8 top-20 z-30"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={cardState}
          initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
