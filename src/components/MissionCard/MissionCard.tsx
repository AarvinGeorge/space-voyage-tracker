import { useMemo } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useMissionStore } from '@/store/missionStore'
import { getMissionById } from '@/data/missionsList'
import { useIsMobile } from '@/hooks/useIsMobile'
import MissionCardFull from './MissionCardFull'
import MissionTag from './MissionTag'

// Floating mission card — owns the FULL ⇄ TAG → DISMISSED state machine (PRD F4)
// and drag. Desktop: free-floating + draggable. Mobile: bottom-anchored sheet.
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

  const startDrag = (e: React.PointerEvent) => {
    if (!isMobile) dragControls.start(e)
  }

  const child =
    cardState === 'FULL' ? (
      <MissionCardFull
        mission={mission}
        onHeaderPointerDown={startDrag}
        onMinimize={minimize}
        onClose={closeMissionCard}
      />
    ) : (
      <MissionTag
        mission={mission}
        onHeaderPointerDown={startDrag}
        onExpand={expand}
        onClose={closeMissionCard}
      />
    )

  // ── Mobile: bottom-anchored, not draggable ──
  if (isMobile) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={cardState}
            className="pointer-events-auto"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {child}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ── Desktop: free-floating + draggable (header / whole-tag) ──
  return (
    <motion.div
      key={selectedMissionId}
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      className="pointer-events-auto absolute right-8 top-4 z-30"
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
