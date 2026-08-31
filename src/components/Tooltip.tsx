import type { ReactNode } from 'react'

export function Tooltip({ children, text }: { children: ReactNode; text: string }) {
  return <span className="tooltip-wrap">{children}<span className="tooltip" role="tooltip">{text}</span></span>
}
