import { useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { GODS, ROLE_IMAGES, ROLE_LABELS, TEAM_LABELS } from '../data'
import type { PlayerTokenState, ToolMode } from '../types'

interface Props {
  token: PlayerTokenState
  mode: ToolMode
  onOpen: () => void
  onMoveStart: (token: PlayerTokenState) => void
  onMove: (id: string, clientX: number, clientY: number) => void
  onMoveEnd: () => void
  onKeyboardMove: (id: string, dx: number, dy: number) => void
}
export function PlayerToken({ token, mode, onOpen, onMoveStart, onMove, onMoveEnd, onKeyboardMove }: Props) {
  const pointerStart = useRef<{ x: number; y: number } | undefined>(undefined)
  const dragged = useRef(false)
  const god = GODS.find(item => item.name === token.god)
  const label = `${TEAM_LABELS[token.team]} · ${ROLE_LABELS[token.role]}${token.god ? ` · ${token.god}` : ''}`
  const down = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (mode !== 'select') return
    event.stopPropagation(); pointerStart.current = { x: event.clientX, y: event.clientY }; dragged.current = false
    event.currentTarget.setPointerCapture(event.pointerId); onMoveStart(token)
  }
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const movement: Record<string, [number, number]> = { ArrowLeft: [-.01, 0], ArrowRight: [.01, 0], ArrowUp: [0, -.01], ArrowDown: [0, .01] }
    if (movement[event.key]) { event.preventDefault(); onKeyboardMove(token.id, ...movement[event.key]) }
  }
  return <button className={`player-token ${token.team}`} style={{ left: `${token.x * 100}%`, top: `${token.y * 100}%`, width: token.size, height: token.size }}
    aria-label={label} data-tooltip={label} onPointerDown={down}
    onPointerMove={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const start=pointerStart.current; if(start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>4) dragged.current=true; onMove(token.id, event.clientX, event.clientY) }}
    onPointerUp={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; event.currentTarget.releasePointerCapture(event.pointerId); onMoveEnd() }}
    onClick={() => { if (!dragged.current) onOpen(); dragged.current=false }} onKeyDown={keyDown}>
    <span className="team-glyph" aria-hidden="true">{token.team === 'ally' ? 'A' : 'E'}</span>
    <img src={god?.src ?? ROLE_IMAGES[token.role]} alt="" draggable={false} style={god ? { objectPosition: god.objectPosition } : undefined}/>
  </button>
}
