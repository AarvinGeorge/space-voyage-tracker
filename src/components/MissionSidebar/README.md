# MissionSidebar — implementation notes

## Component responsibilities

- `MissionSidebar.tsx` — container. Reads `selectedMissionId` and `sidebarCollapsed` from the global Zustand store. Owns local state: search query, focused row id, agency expanded/collapsed map. Passes resolved props down to `AgencyGroup` and `MissionRow`.
- `AgencyGroup.tsx` — presentational. Takes `{ label, missions, isFirst, open, onOpenChange, selectedMissionId, tabbableId, onSelect, onHover, onRowFocus }`. Renders the hairline separator (when `!isFirst`), the 28px header row, and the list of MissionRows when `open`. No store access.
- `MissionRow.tsx` — presentational. Takes `{ mission, active, tabIndex, onSelect, onHover, onFocus }`. No store access. No business logic.
- `MissionSearch.tsx` — presentational. Takes `{ value, onChange, onClear, inputRef }`. No store access.

## Custom hooks

- `useDebouncedValue(value, delay)` — generic debounce, reused for the search input (150ms).
- `useFilteredMissions(query)` — encapsulates the filter logic and returns `{ groups, totalCount }`. Today the matcher is `.toLowerCase().includes()`. Tomorrow it can be Fuse.js fuzzy matching without touching the components — the hook signature is stable.

## State ownership

UI-only state (search query, agency expanded map, focused row id) lives in `useState` inside `MissionSidebar.tsx`, NOT in the global Zustand store. Only cross-component state (`selectedMissionId`, `hoveredMissionId`, `sidebarCollapsed`) belongs in the store. (`searchQuery` was removed from the store in v1.3.)

## Keyboard + ARIA

- `role="navigation"` on the sidebar root, `role="listbox"` on the scrollable rail, `role="option"` + `aria-selected` + `id={mission.id}` on each row. Radix `Collapsible.Trigger` provides `aria-expanded`/`aria-controls` on agency headers.
- Roving tabindex: exactly one row is the tab stop (`tabIndex={0}`, the rest `-1`). ArrowUp/ArrowDown move focus through visible rows, Enter selects, Cmd+K / Ctrl+K focuses search, Esc clears + blurs search.

## Future: scaling past 50 missions

The current implementation renders all rows in the DOM. At 25 missions this is fine. When the curated list grows past 50, drop in `react-window` to virtualize:

1. Wrap the agency stack in `<FixedSizeList itemSize={32} itemCount={totalCount}>` (height = sidebar height minus header + search + footer).
2. Replace the `.map()` over flattened mission rows with the FixedSizeList's `Row` render prop.
3. Agency group headers become "sticky" rows using the `react-window` group header pattern.

The `MissionRow` component takes flat props and doesn't care whether it's rendered via `.map()` or via a virtualizer — so this is a non-breaking swap when the time comes.
