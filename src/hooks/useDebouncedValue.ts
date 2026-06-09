import { useEffect, useState } from 'react'

// Generic debounce (v1.3 F1.7c). The displayed input value updates immediately
// (controlled component); the returned value only changes after `delay` ms of
// idle, so the filter doesn't recompute on every keystroke.
export function useDebouncedValue<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
