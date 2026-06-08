# Artemis II Mission Tracker

## Project Overview
A high-fidelity, live mission tracking dashboard for NASA's Artemis II 10-day crewed lunar flyby mission. Integrates real-world NASA OEM trajectory data (3,212 points) with live JPL Horizons telemetry via serverless proxies. Displays a 3D interactive spacecraft chevron alongside real-time mission telemetry, timeline, and event data.

## Mission Status
**Artemis II has launched (as of April 2026).** The mission is live/in-progress. `isLive` will be `true` for users visiting the tracker.

### Live Telemetry Architecture
- **JPL Horizons** (`/api/horizons-proxy`) is the sole live data source. It returns geocentric EME2000 state vectors (x, y, z, vx, vy, vz in km / km/s) which `TelemetryStrip` uses to compute distance-to-Earth, distance-to-Moon, and velocity magnitude directly.
- **`nasa.gov/trackartemis`** is a Unity WebGL 3D visualization — not a JSON API. It cannot be parsed for telemetry data. The `useARTOWTelemetry` hook and `/api/nasa-proxy` have been removed as dead code.
- `TelemetryData`, `telemetry`, and `setTelemetry` have been removed from the store — all live metrics come from `actualCurrentVector` (Horizons).

## Tech Stack
- **Framework**: React 18 + TypeScript (strict mode)
- **Build tool**: Vite
- **3D rendering**: React Three Fiber (R3F) + Three.js
- **State management**: Zustand (`useMissionStore`)
- **Backend/Proxies**: Vercel Serverless Functions (`/api/horizons-proxy`)
- **Deployment**: Vercel (Production)

## Project Structure
```
api/
  horizons-proxy.ts        # JPL Horizons API bridge (State Vectors)
  nasa-proxy.ts            # NASA TrackArtemis API bridge (Distances)
src/
  components/
    SceneCanvas.tsx        # R3F Canvas, Earth, Moon, TrajectoryLine
    OrionModel.tsx         # Directional chevron + white concentric ripples (LIVE mode)
    HUD/
      TelemetryStrip.tsx   # Top-left: Real-time Dist/Vel (Historic/Live/Projected)
      PhaseScrubber.tsx    # Bottom: Capped scrubber [0, Live] with status indicators
      MissionIdentity.tsx  # Top-center: Mission name + phase
      MissionElapsed.tsx   # Top-right: Live MET clock + UTC
      EventTimeline.tsx    # Right sidebar: milestone feed (desktop only)
      HardwareControls.tsx # Left sidebar: camera/zoom controls (desktop only)
  store/
    missionStore.ts        # Zustand: currentMissionTime, isLive, actualTrajectory, etc.
  hooks/
    useHorizonsTelemetry.ts # Periodic JPL Horizons polling (sole live data source)
    useIsMobile.ts          # Returns true when viewport < 640px
  data/
    trajectory.json        # 3,212-point high-fidelity mission plan
    missionCurve.ts        # CatmullRomCurve3 + coordinate mapping (1 unit = 1,000 km)
```

## Coordinate System
- `1 scene unit = 1,000 km`
- `traj.y → scene -Z` (Earth→Moon depth axis)
- `traj.z → scene Y` (orbital inclination)
- `traj.x → scene X` (lateral drift)
- Earth radius: `6.371 units`, Moon radius: `1.737 units` (proportional)
- Moon position: `(0, 0, -384.4)` scene units

## HUD Layout
### Desktop (≥640px)
- **Top left**: `TelemetryStrip` (3-col grid: Dist Earth, Dist Moon, Velocity, Status, Phase, JPL Updated)
- **Top center**: `MissionIdentity` (mission name + phase)
- **Top right**: `MissionElapsed` (DAY N — T+HHhMMmSSs, UTC date/time)
- **Left sidebar**: `HardwareControls` (camera mode + zoom slider)
- **Right sidebar**: `EventTimeline` (milestone feed, scrollable)
- **Bottom**: `PhaseScrubber` (Play/Pause, timeline, LIVE pin outside-right)

### Mobile (<640px)
- **Top**: `TelemetryStrip` (2-col grid, 4 metrics) + `MissionElapsed` (compact) side by side
- **Below top**: `MissionIdentity` centered
- `HardwareControls` and `EventTimeline` hidden (touch gestures replace camera controls)
- **Bottom**: `PhaseScrubber` (phase tick labels hidden, LIVE button positioned above bar)

## Store Shape (`missionStore.ts`)
```ts
currentMissionTime: number      // 0–3211, index into trajectory
isLive: boolean                 // True if at or past getRealTimeIndex()
isPlaying: boolean              // Playback state (stops at live mark)
actualTrajectory: StateVector[] // Flown arc from HORIZONS
actualCurrentVector: StateVector|null // Latest live vector from JPL
lastHorizonsUpdate: Date|null   // Wall-clock time of last successful HORIZONS poll
```

## Design Direction
- Terminal Mission Control aesthetic: Monochrome monospace.
- **Active state**: White fill, black text.
- **Live state**: Pulsing red indicators (`#ff3333`).
- **Telemetry Logic**: If `isLive`, use JPL data. If scrubbing back, use historic planned data.

## Deployment Notes
- Build: `npm run build`
- Deploy: `vercel --prod`
- Proxies configured in `api/` directory for Vercel deployment.

---

# v1 Multi-Mission Extension (Space Voyage Tracker)

The v0 Artemis II tracker is now one of **25 curated missions** in a multi-mission
3D solar system command center. The v0 Terminal Mission Control aesthetic and
Artemis II behavior are preserved; the Artemis II HUD renders **only when Artemis
II is the selected mission**. Planning docs:
`../09_founders_inc_offseason/space-voyage-tracker/` (PRD, DESIGN.md, etc.).

## Build-time data (zero runtime API calls)
All mission data is generated at build time and committed. v1 makes **no runtime
API calls** (v0's live JPL Horizons polling is deprecated for v1, reserved for v2).
Scripts (run manually, locally — NOT chained into `build`):
- `npm run fetch:missions` — validates the curated dataset (`src/data/missions.ts`)
- `npm run fetch:trajectories` — bakes `src/data/missions/trajectories/<slug>.json` + resolves status
- `npm run fetch:images` — Wikimedia Commons hero images → `public/missions/<slug>.webp`
- `npm run generate:summaries` — Anthropic Claude SDK → `src/data/missions/summaries/<slug>.md`
  (reads `ANTHROPIC_API_KEY` from `code/.env`; key is **local-only**, never committed, never on Vercel)

## Mission data model
- `src/data/missions.ts` — 25 `Mission` records (curated, committed). Add a 26th
  mission by appending one record here; nothing else changes.
- `src/data/types.ts` — `Mission`, `TrajectoryType`, `MilestoneEvent`, etc.
- **Status is never hardcoded** (PRD F2.0). `src/lib/resolveStatus.ts` derives it
  from `failureOutcome` / `partialOutcome` / `launchDate` / `primaryEndDate` /
  `livelyTracked`. UI calls `getStatus(mission)`.
- `src/data/missionsList.ts` — `getMissionById`, `getMissionsByAgency`, `getStatus`, agency order/labels.
- `src/data/summaries.ts` — loads committed `.md` summaries via `import.meta.glob` (raw); graceful when absent.

## Store additions (`missionStore.ts`)
v0 fields are unchanged (`currentMissionTime` stays index-based for Artemis).
Added: `selectedMissionId`, `missions`, `hoveredMissionId`, `viewMode`
(`EARTH_SYSTEM | HELIOCENTRIC`), `cardState` (`FULL | TAG | DISMISSED`),
`cardPosition`, `sidebarCollapsed`, `searchQuery`, `missionT` (normalized 0-1
timeline position), `timelinePlaying`, `playbackSpeed`. Actions: `selectMission`,
`closeMissionCard`, `setMissionT`, `toggleTimelinePlay`, `cycleSpeed`, etc.
Initial mission is read synchronously from `?mission=<slug>` (deep-link).

## 3D layers
- `src/lib/solarSystem.ts` — shared body positions/radii (earth-system + log-compressed heliocentric).
- `src/lib/trajectories/` — 13 archetype generators + `index.ts` (prefers committed JSON, else computes; Artemis defers to `missionCurve`).
- `src/components/SolarSystem/` — polyhedral Sun/planets/belt, Titan/67P/Ryugu, L2, Kármán, CameraRig.
- `src/components/Trajectories/TrajectoryArchetype.tsx` — Option B white opacity-ramp path + chevron.
- `SceneCanvas.tsx` renders the **v0 Artemis scene only for `artemis-2`**; all other missions use `SolarSystem` + `TrajectoryArchetype` + `CameraRig`.

## UI shell
- `TopBar/`, `Footer/PageFooter` (locked disclosure text), `MissionSidebar/`
  (agency-grouped, A+B active state, search, collapse), `MissionCard/` (FULL/TAG/
  DISMISSED, draggable), `Timeline/MissionTimeline` (replaces v0 `PhaseScrubber`,
  which is deprecated and not rendered), `hooks/useMissionUrlHash.ts`.

## Stack additions
Tailwind v4 (`@tailwindcss/vite`) + shadcn/ui (button/input/scroll-area/collapsible/sheet)
mapped to DESIGN.md tokens, Framer Motion, lucide-react, JetBrains Mono + Inter
(`@fontsource`). Build-only: `@anthropic-ai/sdk`, `sharp`, `tsx`, `dotenv`.
