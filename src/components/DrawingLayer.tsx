import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Point, Stroke, ToolMode } from '../types'
import { eventToNormalized, makeId } from '../utils'

interface Props { strokes: Stroke[]; mode: ToolMode; color: string; width: number; opacity: number; onAdd: (stroke: Stroke) => void; onErase: (id: string) => void }
const pathData = (points: Point[]) => points.length ? `M ${points.map(p => `${p.x * 1000} ${p.y * 1000}`).join(' L ')}` : ''
const distToSegment = (p: Point, a: Point, b: Point) => {
  const dx = b.x-a.x, dy = b.y-a.y, l2 = dx*dx+dy*dy
  const t = l2 ? Math.max(0, Math.min(1, ((p.x-a.x)*dx+(p.y-a.y)*dy)/l2)) : 0
  return Math.hypot(p.x-(a.x+t*dx), p.y-(a.y+t*dy))
}
export function DrawingLayer({ strokes, mode, color, width, opacity, onAdd, onErase }: Props) {
  const [draft, setDraft] = useState<Stroke | null>(null)
  const point = (event: ReactPointerEvent<SVGSVGElement>) => eventToNormalized(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())
  const eraseAt = (p: Point) => {
    const found = [...strokes].reverse().find(stroke => stroke.points.some((current, i) => i > 0 && distToSegment(p, stroke.points[i-1], current) < .025))
    if (found) onErase(found.id)
  }
  const down = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (mode === 'select') return
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
    const p = point(event)
    if (mode === 'eraser') { eraseAt(p); return }
    setDraft({ id: makeId(), kind: mode === 'arrow' ? 'arrow' : 'freehand', points: [p], color, width, opacity })
  }
  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const p = point(event)
    if (mode === 'eraser') { eraseAt(p); return }
    setDraft(current => current ? { ...current, points: current.kind === 'arrow' ? [current.points[0], p] : [...current.points, p] } : null)
  }
  const up = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (draft && draft.points.length > 1) onAdd(draft)
    setDraft(null)
  }
  const rendered = draft ? [...strokes, draft] : strokes
  return <svg className={`drawing-layer mode-${mode}`} viewBox="0 0 1000 1000" preserveAspectRatio="none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Capa de dibujo táctico">
    <defs>{rendered.filter(s => s.kind === 'arrow').map(s => <marker key={s.id} id={`arrow-${s.id}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill={s.color}/></marker>)}</defs>
    {rendered.map(stroke => <path key={stroke.id} d={pathData(stroke.points)} fill="none" stroke={stroke.color} strokeWidth={stroke.width * 2.2} strokeOpacity={stroke.opacity} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" markerEnd={stroke.kind === 'arrow' ? `url(#arrow-${stroke.id})` : undefined}/>)}</svg>
}
