import { useEffect, useState } from 'react'

// Compact/touch layout (drawer + tag + bottom sheet) below this width; the
// desktop sidebar + floating card only fits comfortably at >= 1024px (the
// Tailwind `lg` breakpoint), so TopBar's `lg:` classes must stay in sync.
export const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}
