import { useState } from 'react'
import TelemetryStrip from './TelemetryStrip'
import MissionIdentity from './MissionIdentity'
import MissionElapsed from './MissionElapsed'
import HardwareControls from './HardwareControls'
import EventTimeline from './EventTimeline'
import EventDrawer from './EventDrawer'
import { useMissionStore } from '@/store/missionStore'
import { useIsMobile } from '@/hooks/useIsMobile'

// The v0 Artemis II HUD, shown ONLY when Artemis II is the selected mission
// (handoff step L). PhaseScrubber is intentionally excluded — it is deprecated
// in v1 and replaced for all missions by MissionTimeline.
//
// v1.3 E3: the root carries `.artemis-ii-hud-root`, which restores the v0 fluid
// rem scaling locally (index.css) so this HUD renders pixel-identical to v0 even
// though the rest of the dashboard now uses a fixed 16px root. The wrapper is a
// non-positioned block whose children are all absolute/portaled, so it adds no
// layout box and the HUD still positions relative to <main> exactly as before.
export default function ArtemisHUD() {
  const isMobile = useIsMobile()
  const [feedOpen, setFeedOpen] = useState(false)

  return (
    <div className="artemis-ii-hud-root">
      {isMobile ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 px-4 pt-3">
            <div className="pointer-events-auto">
              <TelemetryStrip />
            </div>
            <div className="pointer-events-auto flex flex-col items-end gap-2">
              <MissionIdentity />
              <MissionElapsed />
            </div>
          </div>
          <EventDrawer
            open={feedOpen}
            onClose={() => {
              setFeedOpen(false)
              useMissionStore.getState().setMobileDrawerOpen(false)
              useMissionStore.getState().setCameraMode('topdown')
            }}
          />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-6">
          {/* top row */}
          <div className="grid w-full grid-cols-[1fr_2.5fr_1fr] items-start">
            <div className="pointer-events-auto">
              <TelemetryStrip />
            </div>
            <div className="pointer-events-auto flex justify-center">
              <MissionIdentity />
            </div>
            <div className="pointer-events-auto flex justify-end">
              <MissionElapsed />
            </div>
          </div>

          {/* mid row */}
          <div className="flex w-full flex-1 items-stretch justify-between" style={{ minHeight: 0 }}>
            <div className="pointer-events-auto h-fit self-center">
              <HardwareControls />
            </div>
            <div className="pointer-events-auto flex min-h-0 flex-col">
              <EventTimeline />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
