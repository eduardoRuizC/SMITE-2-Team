import { useCallback, useEffect, useRef, useState } from 'react'
import { LANDMARKS, MAPS, MARKER_TYPES, getLandmarkPoint, initialBoardState } from '../data'
import { exportBoardJson, exportBoardPng, type ExportArea } from '../exportBoard'
import type { BoardState, MarkerState, PlayerTokenState, Stroke, ToolMode } from '../types'
import { clamp, eventToNormalized, isValidBoardState, loadState, makeId, pushHistory, redoHistory, saveState, undoHistory, type History } from '../utils'
import { BoardCanvas } from './BoardCanvas'
import { DrawingToolbar } from './DrawingToolbar'
import { ExportControls } from './ExportControls'
import { FocusControls, type FocusMenus } from './FocusControls'
import { GodSelector } from './GodSelector'
import { Icon } from './Icon'
import { ImageExportDialog } from './ImageExportDialog'
import { MapSelector } from './MapSelector'
import { MarkerEditor } from './MarkerEditor'
import { MarkerPalette } from './MarkerPalette'
import { TeamPanel } from './TeamPanel'
import { Tooltip } from './Tooltip'

type Movable = PlayerTokenState | MarkerState
export function TacticalBoard() {
  const [history, setHistory] = useState<History<BoardState>>(() => ({ past: [], present: loadState(), future: [] }))
  const [mode, setMode] = useState<ToolMode>('select')
  const [godToken, setGodToken] = useState<PlayerTokenState>()
  const [selectedMarker, setSelectedMarker] = useState<string>()
  const [notice, setNotice] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [showImageExport, setShowImageExport] = useState(false)
  const [focusMenus, setFocusMenus] = useState<FocusMenus>({ ally: false, enemy: false, markers: false, drawing: false })
  const appRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const gestureBefore = useRef<BoardState | undefined>(undefined)
  const state = history.present

  const flash = useCallback((message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }, [])
  const commit = useCallback((next: BoardState | ((current: BoardState) => BoardState)) => setHistory(current => pushHistory(current, typeof next === 'function' ? next(current.present) : next)), [])
  const preview = useCallback((next: (current: BoardState) => BoardState) => setHistory(current => ({ ...current, present: next(current.present) })), [])
  const undo = useCallback(() => setHistory(undoHistory), []), redo = useCallback(() => setHistory(redoHistory), [])
  useEffect(() => { const id=window.setTimeout(()=>saveState(state),250); return()=>clearTimeout(id) }, [state])
  useEffect(() => { const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[undo,redo])
  useEffect(() => {
    const fullscreenChanged = () => { if (focusMode && !document.fullscreenElement) setFocusMode(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && focusMode && !godToken) setFocusMode(false) }
    document.addEventListener('fullscreenchange', fullscreenChanged); window.addEventListener('keydown', escape)
    return () => { document.removeEventListener('fullscreenchange', fullscreenChanged); window.removeEventListener('keydown', escape) }
  }, [focusMode, godToken])

  const beginMove = (value: Movable) => { gestureBefore.current = structuredClone(state); setSelectedMarker('type' in value ? value.id : undefined) }
  const move = (kind: 'token'|'marker', id: string, clientX: number, clientY: number) => {
    if (!boardRef.current) return; const p=eventToNormalized(clientX,clientY,boardRef.current.getBoundingClientRect()), edge=kind==='token'?.025:.018
    preview(current => kind==='token'?{...current,tokens:current.tokens.map(v=>v.id===id?{...v,x:clamp(p.x,edge,1-edge),y:clamp(p.y,edge,1-edge)}:v)}:{...current,markers:current.markers.map(v=>v.id===id?{...v,x:clamp(p.x,edge,1-edge),y:clamp(p.y,edge,1-edge),landmarkId:undefined}:v)})
  }
  const endMove = () => {
    const before = gestureBefore.current
    gestureBefore.current = undefined
    if (!before) return
    const snapshot: BoardState = before
    setHistory(current => JSON.stringify(snapshot) === JSON.stringify(current.present) ? current : {
      past: [...current.past, snapshot].slice(-60), present: current.present, future: [],
    })
  }
  const keyboardMove = (kind:'token'|'marker',id:string,dx:number,dy:number) => commit(current => kind==='token'?{...current,tokens:current.tokens.map(v=>v.id===id?{...v,x:clamp(v.x+dx,.025,.975),y:clamp(v.y+dy,.025,.975)}:v)}:{...current,markers:current.markers.map(v=>v.id===id?{...v,x:clamp(v.x+dx,.018,.982),y:clamp(v.y+dy,.018,.982),landmarkId:undefined}:v)})
  const addMarker = (type: string, x=.5, y=.5) => { const meta=MARKER_TYPES.find(m=>m.id===type);if(!meta)return;const marker:MarkerState={id:makeId(),type,label:'',color:type==='objective'?'warning':'neutral',size:type==='objective'?68:50,x:clamp(x,.03,.97),y:clamp(y,.03,.97)};commit(current=>({...current,markers:[...current.markers,marker]}));setSelectedMarker(marker.id) }
  const updateMarker = (id:string,patch:Partial<MarkerState>) => commit(current=>({...current,markers:current.markers.map(m=>m.id===id?{...m,...patch}:m)}))
  const marker = state.markers.find(item=>item.id===selectedMarker)
  const reset = () => { if(window.confirm('¿Restablecer toda la pizarra? Se eliminarán composiciones, marcadores y dibujos.')){commit(initialBoardState());setSelectedMarker(undefined);setMode('select');flash('Pizarra restablecida')} }
  const importJson = async(file:File)=>{try{const parsed:unknown=JSON.parse(await file.text());if(!isValidBoardState(parsed))throw new Error('El archivo no tiene un estado de pizarra válido.');commit(parsed);setSelectedMarker(undefined);flash('Estrategia importada')}catch(error){window.alert(error instanceof Error?error.message:'No se pudo importar el archivo.')}}
  const enterFocus = () => {
    setFocusMode(true); setFocusMenus({ ally: false, enemy: false, markers: false, drawing: false })
    appRef.current?.requestFullscreen?.().catch(() => undefined)
  }
  const exitFocus = () => {
    setFocusMode(false); setFocusMenus({ ally: false, enemy: false, markers: false, drawing: false })
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
  }
  const toggleFocusMenu = (menu: keyof FocusMenus) => setFocusMenus(current => ({ ...current, [menu]: !current[menu] }))
  const visibleExportArea = (): ExportArea => {
    const board = boardRef.current
    const viewport = board?.parentElement
    if (!board || !viewport) return { x: 0, y: 0, width: 1 / state.zoom, height: 1 / state.zoom }
    const width = Math.min(1, viewport.clientWidth / board.offsetWidth) || 1 / state.zoom
    const height = Math.min(1, viewport.clientHeight / board.offsetHeight) || 1 / state.zoom
    return {
      x: clamp(viewport.scrollLeft / board.offsetWidth, 0, 1 - width) || 0,
      y: clamp(viewport.scrollTop / board.offsetHeight, 0, 1 - height) || 0,
      width,
      height,
    }
  }
  const runPngExport = (scope: 'full' | 'visible' = 'full') => {
    setShowImageExport(false)
    const area = scope === 'visible' ? visibleExportArea() : undefined
    exportBoardPng(state, area).then(()=>flash('PNG exportado')).catch(()=>window.alert('No se pudo exportar el PNG.'))
  }
  const requestPngExport = () => state.zoom > 1 ? setShowImageExport(true) : runPngExport()

  return <div className={`app-shell ${focusMode?'board-focus':''}`} ref={appRef}>
    <header className="topbar"><div className="brand"><div className="brand-rune">Ⅱ</div><div><p>SMITE 2</p><strong>TACTICAL BOARD</strong></div></div><div className="strategy-title"><span>Nombre de la táctica</span><input value={state.tacticName} onChange={e=>preview(s=>({...s,tacticName:e.target.value}))} onBlur={()=>saveState(state)} aria-label="Nombre de la táctica"/></div><MapSelector value={state.mapId} onChange={mapId=>commit(s=>({...s,mapId}))}/><ExportControls state={state} onSave={()=>{saveState(state);flash('Guardado en este dispositivo')}} onExportPng={requestPngExport} onExportJson={()=>exportBoardJson(state)} onImport={importJson} onReset={reset} canUndo={!!history.past.length} canRedo={!!history.future.length} onUndo={undo} onRedo={redo}/><Tooltip text="Mapa a pantalla completa"><button className="top-fullscreen-button" onClick={enterFocus} aria-label="Abrir mapa a pantalla completa"><Icon name="expand"/></button></Tooltip></header>
    <main className="workspace"><div className="left-column"><TeamPanel team="ally" tokens={state.tokens.filter(t=>t.team==='ally')} onSelect={setGodToken} onResizeTeam={size=>commit(s=>({...s,tokens:s.tokens.map(token=>token.team==='ally'?{...token,size}:token)}))}/><div className="field-note ally"><span>01</span><p><strong>Plan de apertura</strong>Arrastra las fichas al mapa y traza la primera rotación.</p></div></div>
      <section className="board-column"><div className="board-meta"><div><span className="live-pill"><i/> SESIÓN LOCAL</span><span>{state.tokens.filter(t=>t.god).length}/10 dioses asignados</span></div><span>{MAPS.find(m=>m.id===state.mapId)?.label}</span></div><BoardCanvas ref={boardRef} state={state} mode={mode} selectedMarker={selectedMarker} onZoom={zoom=>commit(s=>({...s,zoom}))} onTokenOpen={setGodToken} onMoveStart={beginMove} onMove={move} onMoveEnd={endMove} onKeyboardMove={keyboardMove} onMarkerSelect={setSelectedMarker} onAddMarker={addMarker} onAddStroke={(stroke:Stroke)=>commit(s=>({...s,strokes:[...s.strokes,stroke]}))} onEraseStroke={id=>commit(s=>({...s,strokes:s.strokes.filter(v=>v.id!==id)}))}/></section>
      <div className="right-column"><TeamPanel team="enemy" tokens={state.tokens.filter(t=>t.team==='enemy')} onSelect={setGodToken} onResizeTeam={size=>commit(s=>({...s,tokens:s.tokens.map(token=>token.team==='enemy'?{...token,size}:token)}))}/><MarkerPalette onAdd={addMarker}/></div></main>
    {(!focusMode||focusMenus.drawing)&&<DrawingToolbar mode={mode} setMode={setMode} {...state.drawing} onDrawingChange={patch=>preview(s=>({...s,drawing:{...s.drawing,...patch}}))} onClear={()=>state.strokes.length&&commit(s=>({...s,strokes:[]}))}/>} 
    {focusMode&&<><FocusControls menus={focusMenus} canUndo={!!history.past.length} canRedo={!!history.future.length} onToggle={toggleFocusMenu} onUndo={undo} onRedo={redo} onExit={exitFocus}/><div className="focus-map-selector"><MapSelector value={state.mapId} onChange={mapId=>commit(s=>({...s,mapId}))}/></div>
      {focusMenus.ally&&<aside className="focus-panel-stack left" aria-label="Menú aliado"><TeamPanel team="ally" tokens={state.tokens.filter(t=>t.team==='ally')} onSelect={setGodToken} onResizeTeam={size=>commit(s=>({...s,tokens:s.tokens.map(token=>token.team==='ally'?{...token,size}:token)}))}/></aside>}
      {(focusMenus.enemy||focusMenus.markers)&&<aside className="focus-panel-stack right" aria-label="Menús enemigos y marcadores">{focusMenus.enemy&&<TeamPanel team="enemy" tokens={state.tokens.filter(t=>t.team==='enemy')} onSelect={setGodToken} onResizeTeam={size=>commit(s=>({...s,tokens:s.tokens.map(token=>token.team==='enemy'?{...token,size}:token)}))}/>} {focusMenus.markers&&<MarkerPalette onAdd={type=>{addMarker(type);setFocusMenus(current=>({...current,markers:false}))}}/>}</aside>}
    </>}
    {marker&&<MarkerEditor marker={marker} onChange={patch=>updateMarker(marker.id,patch)} onPlace={landmarkId=>{const place=LANDMARKS.find(item=>item.id===landmarkId);if(place){const point=getLandmarkPoint(place,state.mapId);updateMarker(marker.id,{...point,landmarkId,label:marker.label||place.label})}}} onDuplicate={()=>{const copy={...marker,id:makeId(),x:clamp(marker.x+.04),y:clamp(marker.y+.04),landmarkId:undefined};commit(s=>({...s,markers:[...s.markers,copy]}));setSelectedMarker(copy.id)}} onDelete={()=>{commit(s=>({...s,markers:s.markers.filter(m=>m.id!==marker.id)}));setSelectedMarker(undefined)}} onClose={()=>setSelectedMarker(undefined)}/>} 
    {godToken&&<GodSelector token={state.tokens.find(t=>t.id===godToken.id)??godToken} onSelect={god=>commit(s=>({...s,tokens:s.tokens.map(t=>t.id===godToken.id?{...t,god}:t)}))} onResize={size=>commit(s=>({...s,tokens:s.tokens.map(t=>t.id===godToken.id?{...t,size}:t)}))} onClose={()=>setGodToken(undefined)}/>}
    {showImageExport&&<ImageExportDialog onChoose={runPngExport} onClose={()=>setShowImageExport(false)}/>}
    <div className={`toast ${notice?'visible':''}`} role="status" aria-live="polite">{notice}</div>
  </div>
}
