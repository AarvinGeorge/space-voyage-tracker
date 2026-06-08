import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SceneCanvas from './components/SceneCanvas'
import TopBar from './components/TopBar/TopBar'
import PageFooter from './components/Footer/PageFooter'
import MissionSidebar from './components/MissionSidebar/MissionSidebar'
import MissionCard from './components/MissionCard/MissionCard'
import MissionTimeline from './components/Timeline/MissionTimeline'
import ArtemisHUD from './components/HUD/ArtemisHUD'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './components/ui/sheet'
import { useMissionStore } from './store/missionStore'
import { useMissionUrlHash } from './hooks/useMissionUrlHash'
import { useIsMobile } from './hooks/useIsMobile'
import './index.css'

// ─────────────────────────────────────────────────────────────────────────
// v1 multi-mission shell. The v0 Artemis II experience is preserved and shown
// only when Artemis II is selected (ArtemisHUD). All 25 missions are driven by
// stored, build-time data — there are zero runtime API calls (footer claim);
// v0's live JPL Horizons polling is deprecated for v1 and reserved for v2.
// ─────────────────────────────────────────────────────────────────────────
export default function App() {
  useMissionUrlHash()
  const isMobile = useIsMobile()
  const selectedMissionId = useMissionStore((s) => s.selectedMissionId)
  const toggleTimelinePlay = useMissionStore((s) => s.toggleTimelinePlay)
  const isArtemis = selectedMissionId === 'artemis-2'
  const [sheetOpen, setSheetOpen] = useState(false)

  // Space toggles timeline playback.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggleTimelinePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleTimelinePlay])

  return (
    <div className="flex h-[100svh] w-screen flex-col overflow-hidden bg-background">
      <TopBar onMenuClick={() => setSheetOpen(true)} />

      <div className="flex min-h-0 flex-1">
        {!isMobile && <MissionSidebar />}

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <SceneCanvas />

          {/* Vignette — darkens edges so overlays read over the 3D scene (v0). */}
          <div
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              background: [
                'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)',
                'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.55) 100%)',
              ].join(', '),
            }}
          />

          {isArtemis && <ArtemisHUD />}
          <MissionCard />
          <MissionTimeline />
        </main>
      </div>

      <PageFooter />

      {/* Mobile mission sidebar as a slide-in sheet (PRD F7). */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[300px] max-w-[85vw] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Missions by agency</SheetTitle>
          </SheetHeader>
          <MissionSidebar mobile onMissionSelected={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      <Analytics />
    </div>
  )
}
