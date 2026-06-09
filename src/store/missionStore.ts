import { create } from 'zustand'
import trajectoryData from '../data/trajectory.json'
import { LAUNCH_N, LAUNCH_TIME_MS, LAST } from '../data/missionCurve'
import type { Mission, ViewMode } from '../data/types'
import { MISSIONS, getMissionById } from '../data/missionsList'

// ── v1 multi-mission additions ──
export type CardState = 'FULL' | 'TAG' | 'DISMISSED'
export type PlaybackSpeed = 1 | 2 | 5 | 10 | 50
export type HudCameraMode = 'PERSPECTIVE' | 'TOP_DOWN' | 'FREE'

// Default selected mission on a cold load with no URL hash (founder pick).
export const DEFAULT_MISSION_ID = 'apollo-11'

// Resolve the initial mission synchronously from the URL (?mission=slug) so a
// deep-link is honoured on first render — no effect race.
function readInitialMissionId(): string {
  if (typeof window === 'undefined') return DEFAULT_MISSION_ID
  const p = new URLSearchParams(window.location.search).get('mission')
  return p && getMissionById(p) ? p : DEFAULT_MISSION_ID
}
const INITIAL_MISSION_ID = readInitialMissionId()
const INITIAL_MISSION = getMissionById(INITIAL_MISSION_ID)

// Mobile opens a selected mission as the compact TAG chip (so the 3D scene stays
// visible); desktop opens the FULL card. Matches the Frame 7 mobile spec.
function defaultCardStateForViewport(): CardState {
  if (typeof window === 'undefined') return 'FULL'
  return window.innerWidth < 640 ? 'TAG' : 'FULL'
}

// Bridge the new normalized timeline (0-1) to v0's index-based Artemis time.
export function tToArtemisIdx(t: number): number {
  return Math.round(t * (LAST + LAUNCH_N) - LAUNCH_N)
}

export interface StateVector {
  timestamp: string
  x: number   // km, EME2000
  y: number   // km, EME2000
  z: number   // km, EME2000
  vx: number  // km/s
  vy: number  // km/s
  vz: number  // km/s
}

const trajectory: StateVector[] = trajectoryData

interface MissionState {
  currentMissionTime: number
  isPlaying: boolean
  isLive: boolean
  isMissionComplete: boolean

  trajectory: StateVector[]
  currentVector: StateVector

  actualTrajectory: StateVector[]
  actualCurrentVector: StateVector | null
  lastHorizonsUpdate: Date | null

  cameraMode: 'topdown' | 'reset' | 'ship' | 'free'
  controlMode: 'pan' | 'rotate'
  zoomLevel: number
  mobileDrawerOpen: boolean

  // ── v1 multi-mission state ──
  missions: Mission[]
  selectedMissionId: string | null
  hoveredMissionId: string | null
  viewMode: ViewMode                 // active solar-system view (auto-set on select; toggleable)
  cardState: CardState
  cardPosition: { x: number; y: number } | null
  sidebarCollapsed: boolean
  searchQuery: string
  missionT: number                   // normalized 0-1 scrubber position for the selected mission
  timelinePlaying: boolean
  playbackSpeed: PlaybackSpeed

  // ── v1.2 HUD chips (H3) ──
  cameraDistance: number             // camera→origin distance, reported from the scene for ScaleChip
  hudCameraMode: HudCameraMode       // PERSPECTIVE | TOP_DOWN | FREE (CameraChip)
  setCameraDistance: (d: number) => void
  cycleHudCameraMode: () => void

  selectMission:   (id: string) => void
  closeMissionCard:() => void
  setCardState:    (s: CardState) => void
  setCardPosition: (p: { x: number; y: number } | null) => void
  setHoveredMission: (id: string | null) => void
  setViewMode:     (m: ViewMode) => void
  setSidebarCollapsed: (c: boolean) => void
  setSearchQuery:  (q: string) => void
  setMissionT:     (t: number) => void
  toggleTimelinePlay: () => void
  setTimelinePlaying: (p: boolean) => void
  cycleSpeed:      () => void
  resetTimeline:   () => void

  setMissionTime:  (index: number) => void
  setIsPlaying:    (playing: boolean) => void
  tick:            () => void
  setCameraMode:   (mode: 'topdown' | 'reset' | 'ship' | 'free') => void
  setControlMode:  (mode: 'pan' | 'rotate') => void
  setZoomLevel:    (level: number) => void
  setMobileDrawerOpen: (open: boolean) => void
  setActualTrajectory:     (vecs: StateVector[]) => void
  setActualCurrentVector:  (vec: StateVector) => void
  getRealTimeIndex: () => number
  goLive:          () => void
}

// Safe trajectory lookup: clamps idx into [0, length-1]
function safeVec(idx: number): StateVector {
  return trajectory[Math.max(0, Math.min(idx, trajectory.length - 1))]
}

// Mission end wall-clock: Artemis II splashdown, 2026-04-11T00:07:00Z
// (Pacific Ocean off San Diego, 8:07 p.m. EDT / 5:07 p.m. PDT on 2026-04-10).
const MISSION_END_MS = new Date('2026-04-11T00:07:00Z').getTime()
function missionIsComplete(): boolean {
  return Date.now() >= MISSION_END_MS
}

export const useMissionStore = create<MissionState>((set, get) => ({
  currentMissionTime: -LAUNCH_N,   // start at liftoff; App.syncToRealTime overrides on mount
  isPlaying:          false,
  isLive:             false,
  isMissionComplete:  missionIsComplete(),
  trajectory,
  currentVector:      trajectory[0],
  actualTrajectory:        [],
  actualCurrentVector:     null,
  lastHorizonsUpdate:      null,
  cameraMode:         'reset',
  controlMode:        'rotate',
  zoomLevel:          50,
  mobileDrawerOpen:   false,

  // ── v1 multi-mission initial state (URL-hash hook may override on mount) ──
  missions:           MISSIONS,
  selectedMissionId:  INITIAL_MISSION_ID,
  hoveredMissionId:   null,
  viewMode:           (INITIAL_MISSION?.viewMode ?? 'EARTH_SYSTEM'),
  cardState:          defaultCardStateForViewport(),
  cardPosition:       null,
  sidebarCollapsed:   false,
  searchQuery:        '',
  missionT:           0,
  timelinePlaying:    false,
  playbackSpeed:      (INITIAL_MISSION?.defaultSpeed ?? 1),
  cameraDistance:     60,
  hudCameraMode:      'PERSPECTIVE',

  setCameraDistance: (d) => {
    // Throttle churn: only update when it moves meaningfully.
    if (Math.abs(d - get().cameraDistance) > Math.max(0.5, get().cameraDistance * 0.01)) {
      set({ cameraDistance: d })
    }
  },
  cycleHudCameraMode: () => {
    const order: HudCameraMode[] = ['PERSPECTIVE', 'TOP_DOWN', 'FREE']
    const idx = order.indexOf(get().hudCameraMode)
    set({ hudCameraMode: order[(idx + 1) % order.length] })
  },

  selectMission: (id) => {
    const mission = getMissionById(id)
    if (!mission) return
    set({
      selectedMissionId: id,
      viewMode: mission.viewMode,
      cardState: defaultCardStateForViewport(),
      cardPosition: null,
      missionT: 0,
      timelinePlaying: false,
      playbackSpeed: mission.defaultSpeed,
    })
    // For Artemis II, drive v0 index-based time so the preserved HUD reflects t=0.
    if (id === 'artemis-2') get().setMissionTime(tToArtemisIdx(0))
  },

  closeMissionCard: () => set({ cardState: 'DISMISSED', timelinePlaying: false }),
  setCardState: (s) => set({ cardState: s }),
  setCardPosition: (p) => set({ cardPosition: p }),
  setHoveredMission: (id) => set({ hoveredMissionId: id }),
  setViewMode: (m) => set({ viewMode: m }),
  setSidebarCollapsed: (c) => set({ sidebarCollapsed: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  setMissionT: (t) => {
    const clamped = Math.max(0, Math.min(1, t))
    set({ missionT: clamped })
    if (get().selectedMissionId === 'artemis-2') get().setMissionTime(tToArtemisIdx(clamped))
  },

  toggleTimelinePlay: () => {
    const { missionT, timelinePlaying } = get()
    // Restart from 0 if at the end.
    if (!timelinePlaying && missionT >= 0.999) get().setMissionT(0)
    set({ timelinePlaying: !get().timelinePlaying })
  },
  setTimelinePlaying: (p) => set({ timelinePlaying: p }),

  cycleSpeed: () => {
    const order: PlaybackSpeed[] = [1, 2, 5, 10, 50]
    const idx = order.indexOf(get().playbackSpeed)
    set({ playbackSpeed: order[(idx + 1) % order.length] })
  },

  resetTimeline: () => {
    set({ missionT: 0, timelinePlaying: false })
    if (get().selectedMissionId === 'artemis-2') get().setMissionTime(tToArtemisIdx(0))
  },

  setMissionTime: (index) => {
    const realIdx = get().getRealTimeIndex()
    const cappedIdx = Math.min(index, realIdx)
    const atEnd = cappedIdx >= realIdx
    const complete = missionIsComplete()
    set({
      currentMissionTime: cappedIdx,
      currentVector: safeVec(cappedIdx),
      isLive: atEnd && !complete,
      isMissionComplete: complete,
      isPlaying: atEnd ? false : get().isPlaying,
    })
  },

  setIsPlaying: (playing) => {
    const { currentMissionTime, getRealTimeIndex } = get()
    const realIdx = getRealTimeIndex()
    if (playing && currentMissionTime >= realIdx) return
    set({ isPlaying: playing })
  },

  tick: () => {
    const { currentMissionTime, getRealTimeIndex } = get()
    const realIdx = getRealTimeIndex()
    const complete = missionIsComplete()
    if (currentMissionTime >= realIdx) {
      set({ isPlaying: false, isLive: !complete, isMissionComplete: complete })
      return
    }
    const next = currentMissionTime + 1
    if (next >= trajectory.length) {
      set({ isPlaying: false, isLive: !complete, isMissionComplete: complete })
      return
    }
    set({
      currentMissionTime: next,
      currentVector: safeVec(next),
      isLive: next >= realIdx && !complete,
      isMissionComplete: complete,
    })
  },

  setCameraMode: (mode) => set({ cameraMode: mode }),
  setControlMode: (mode) => set({ controlMode: mode }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  setActualTrajectory: (vecs) => set({ actualTrajectory: vecs }),
  setActualCurrentVector: (vec) => set({ actualCurrentVector: vec, lastHorizonsUpdate: new Date() }),

  getRealTimeIndex: () => {
    const traj = get().trajectory
    const now = Date.now()
    const oemStart = new Date(traj[0].timestamp + 'Z').getTime()
    const oemEnd   = new Date(traj[traj.length - 1].timestamp + 'Z').getTime()

    // Before liftoff — at launch pad
    if (now <= LAUNCH_TIME_MS) return -LAUNCH_N

    // Between liftoff and OEM data start — in launch arc
    if (now < oemStart) {
      const frac = (now - LAUNCH_TIME_MS) / (oemStart - LAUNCH_TIME_MS)
      return Math.round(-LAUNCH_N + frac * LAUNCH_N)
    }

    if (now >= oemEnd) return traj.length - 1

    // Binary search within OEM data
    let lo = 0, hi = traj.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (new Date(traj[mid].timestamp + 'Z').getTime() < now) lo = mid + 1
      else hi = mid
    }
    return lo
  },

  goLive: () => {
    const { getRealTimeIndex } = get()
    const idx = getRealTimeIndex()
    const complete = missionIsComplete()
    set({
      currentMissionTime: idx,
      currentVector: safeVec(idx),
      isLive: !complete,
      isMissionComplete: complete,
      isPlaying: false,
    })
  },
}))
