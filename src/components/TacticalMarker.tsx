import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { MARKER_COLORS, MARKER_TYPES } from '../data'
import type { MarkerState, ToolMode } from '../types'

interface Props { marker: MarkerState; selected: boolean; mode: ToolMode; onSelect: () => void; onMoveStart: (marker: MarkerState) => void; onMove: (id: string, x: number, y: number) => void; onMoveEnd: () => void; onKeyboardMove: (id: string, dx: number, dy: number) => void }
export function TacticalMarker({ marker, selected, mode, onSelect, onMoveStart, onMove, onMoveEnd, onKeyboardMove }: Props) {
  const meta = MARKER_TYPES.find(item => item.id === marker.type) ?? MARKER_TYPES[0]
  const down = (event: ReactPointerEvent<HTMLButtonElement>) => { if (mode !== 'select') return; event.stopPropagation(); onSelect(); onMoveStart(marker); event.currentTarget.setPointerCapture(event.pointerId) }
  const keyDown = (event: KeyboardEvent) => { const map: Record<string, [number, number]> = { ArrowLeft: [-.01,0], ArrowRight:[.01,0], ArrowUp:[0,-.01], ArrowDown:[0,.01] }; if (map[event.key]) { event.preventDefault(); onKeyboardMove(marker.id, ...map[event.key]) } }
  return <button className={`tactical-marker ${marker.type === 'objective' ? 'objective-marker' : ''} ${selected ? 'selected' : ''}`} style={{ left: `${Number((marker.x*100).toFixed(3))}%`, top: `${Number((marker.y*100).toFixed(3))}%`, width: marker.size, height: marker.size, color: MARKER_COLORS[marker.color], '--marker-size': `${marker.size}px` } as CSSProperties}
    data-tooltip={`${meta.label}${marker.label ? ` · ${marker.label}` : ''}`} aria-label={`${meta.label}${marker.label ? `, ${marker.label}` : ''}`} onPointerDown={down}
    onPointerMove={e => e.currentTarget.hasPointerCapture(e.pointerId) && onMove(marker.id, e.clientX, e.clientY)}
    onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) { e.currentTarget.releasePointerCapture(e.pointerId); onMoveEnd() } }} onKeyDown={keyDown}>
    <span className="marker-symbol">{meta.icon}</span>{marker.label && <span className="marker-label">{marker.label}</span>}
  </button>
}
