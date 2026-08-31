import { forwardRef, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { LANDMARKS, MAPS, getLandmarkPoint } from '../data'
import type { BoardState, MarkerState, PlayerTokenState, Stroke, ToolMode } from '../types'
import { DrawingLayer } from './DrawingLayer'
import { PlayerToken } from './PlayerToken'
import { TacticalMarker } from './TacticalMarker'
import { ZoomControls } from './ZoomControls'

interface Props { state: BoardState; mode: ToolMode; selectedMarker?: string; onZoom: (zoom: number) => void; onTokenOpen: (token: PlayerTokenState) => void; onMoveStart: (value: PlayerTokenState | MarkerState) => void; onMove: (kind: 'token'|'marker', id: string, x: number, y: number) => void; onMoveEnd: () => void; onKeyboardMove: (kind: 'token'|'marker', id: string, dx: number, dy: number) => void; onMarkerSelect: (id?: string) => void; onAddMarker: (type: string, x?: number, y?: number) => void; onAddStroke: (stroke: Stroke) => void; onEraseStroke: (id: string) => void }
export const BoardCanvas = forwardRef<HTMLDivElement, Props>(function BoardCanvas({ state, mode, selectedMarker, onZoom, onTokenOpen, onMoveStart, onMove, onMoveEnd, onKeyboardMove, onMarkerSelect, onAddMarker, onAddStroke, onEraseStroke }, ref) {
  const map = MAPS.find(item => item.id === state.mapId) ?? MAPS[0]
  const viewportRef = useRef<HTMLDivElement>(null)
  const previousZoom = useRef(state.zoom)
  const panStart = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || previousZoom.current === state.zoom) return
    const oldZoom = previousZoom.current
    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / (viewport.clientWidth * oldZoom)
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / (viewport.clientHeight * oldZoom)
    viewport.scrollLeft = centerX * viewport.scrollWidth - viewport.clientWidth / 2
    viewport.scrollTop = centerY * viewport.scrollHeight - viewport.clientHeight / 2
    previousZoom.current = state.zoom
  }, [state.zoom])
  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode !== 'select' || state.zoom <= 1 || (event.target as Element).closest('.player-token,.tactical-marker')) return
    panStart.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panStart.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    event.currentTarget.scrollLeft = panStart.current.left - (event.clientX - panStart.current.x)
    event.currentTarget.scrollTop = panStart.current.top - (event.clientY - panStart.current.y)
  }
  const stopPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    panStart.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const wheelPan = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (state.zoom <= 1) return
    event.preventDefault(); event.currentTarget.scrollLeft += event.deltaX; event.currentTarget.scrollTop += event.deltaY
  }
  return <div className={`board-shell mode-${mode}`}>
    <div className="board-corners" aria-hidden="true"/><div className="board-viewport" ref={viewportRef} tabIndex={state.zoom > 1 ? 0 : -1} aria-label={state.zoom > 1 ? 'Mapa ampliado. Arrastra para desplazarte.' : 'Mapa táctico'} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan} onWheel={wheelPan} onKeyDown={event=>{if(state.zoom<=1)return;const amount=60;if(event.key==='ArrowLeft'){event.preventDefault();event.currentTarget.scrollLeft-=amount}if(event.key==='ArrowRight'){event.preventDefault();event.currentTarget.scrollLeft+=amount}if(event.key==='ArrowUp'){event.preventDefault();event.currentTarget.scrollTop-=amount}if(event.key==='ArrowDown'){event.preventDefault();event.currentTarget.scrollTop+=amount}}}><div className="map-board" ref={ref} style={{ width: `${state.zoom * 100}%` }} onPointerDown={e => e.target === e.currentTarget && onMarkerSelect()} onDragOver={e => { if (e.dataTransfer.types.includes('application/x-tactical-marker')) e.preventDefault() }} onDrop={e => { e.preventDefault(); const type = e.dataTransfer.getData('application/x-tactical-marker'); if (!type) return; const rect=e.currentTarget.getBoundingClientRect(); onAddMarker(type, (e.clientX-rect.left)/rect.width, (e.clientY-rect.top)/rect.height) }}>
      <img className="map-image" src={map.src} alt={`Vista táctica: ${map.label}`} draggable={false}/>
      <div className="team-zone ally-zone" aria-hidden="true"><span>SECTOR ALIADO</span></div><div className="team-zone enemy-zone" aria-hidden="true"><span>SECTOR ENEMIGO</span></div>
      <DrawingLayer strokes={state.strokes} mode={mode} {...state.drawing} onAdd={onAddStroke} onErase={onEraseStroke}/>
      <div className="object-layer">{state.tokens.map(token => <PlayerToken key={token.id} token={token} mode={mode} onOpen={() => onTokenOpen(token)} onMoveStart={onMoveStart} onMove={(id,x,y) => onMove('token',id,x,y)} onMoveEnd={onMoveEnd} onKeyboardMove={(id,dx,dy) => onKeyboardMove('token',id,dx,dy)}/>)}
        {state.markers.map(marker => { const landmark=marker.landmarkId?LANDMARKS.find(item=>item.id===marker.landmarkId):undefined;const displayed=landmark?{...marker,...getLandmarkPoint(landmark,state.mapId)}:marker;return <TacticalMarker key={marker.id} marker={displayed} selected={selectedMarker === marker.id} mode={mode} onSelect={() => onMarkerSelect(marker.id)} onMoveStart={onMoveStart} onMove={(id,x,y) => onMove('marker',id,x,y)} onMoveEnd={onMoveEnd} onKeyboardMove={(id,dx,dy) => onKeyboardMove('marker',id,dx,dy)}/>})}</div>
      <div className="map-caption"><span className={`status-dot ${mode}`}/>{mode === 'select' ? state.zoom > 1 ? 'ZOOM ACTIVO · ARRASTRA EL MAPA' : 'MODO TÁCTICO' : mode === 'eraser' ? 'BORRADOR ACTIVO' : 'DIBUJO ACTIVO'}</div>
    </div></div><ZoomControls zoom={state.zoom} onChange={onZoom}/>
  </div>
})
