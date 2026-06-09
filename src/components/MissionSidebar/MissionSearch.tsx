import type { Ref } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Top-of-sidebar search — PRESENTATIONAL only (v1.3 F1.7a/b): controlled by the
// parent's local state, no store access. Esc clears + blurs (F1.7f).
export default function MissionSearch({
  value,
  onChange,
  onClear,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  onClear: () => void
  inputRef?: Ref<HTMLInputElement>
}) {
  return (
    <div className="relative px-3 pb-2">
      <Search
        size={13}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-[9px] text-text-muted"
      />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClear()
            e.currentTarget.blur()
          }
        }}
        placeholder="SEARCH MISSIONS"
        aria-label="Search missions"
        className="h-8 pl-7 font-caption-mono text-[11px] tracking-[0.08em] uppercase placeholder:text-text-muted"
      />
    </div>
  )
}
