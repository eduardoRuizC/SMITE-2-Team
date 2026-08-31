import { LANDMARKS, MARKER_COLORS, MARKER_TYPES } from '../data'
import type { MarkerColor, MarkerState } from '../types'
import { Icon } from './Icon'

export function MarkerEditor({ marker, onChange, onPlace, onDuplicate, onDelete, onClose }: { marker: MarkerState; onChange: (patch: Partial<MarkerState>) => void; onPlace: (landmarkId: string) => void; onDuplicate: () => void; onDelete: () => void; onClose: () => void }) {
  const type = MARKER_TYPES.find(item => item.id === marker.type)
  return <aside className="marker-editor" aria-label="Editar marcador">
    <header><div><p className="eyebrow">Marcador seleccionado</p><strong>{type?.label}</strong></div><button className="icon-button" onClick={onClose} aria-label="Cerrar edición"><Icon name="close" size={16}/></button></header>
    <label><span>Etiqueta</span><input maxLength={24} value={marker.label} onChange={e => onChange({ label: e.target.value })} placeholder="Ej. Baitear" /></label>
    <label><span>Colocar automáticamente</span><select defaultValue="" onChange={e => { if(e.target.value) onPlace(e.target.value); e.currentTarget.value='' }} aria-label="Colocar marcador en ubicación del mapa"><option value="" disabled>Elegir ubicación…</option>{(['objective','titan','phoenix','tower'] as const).map(group => <optgroup key={group} label={{objective:'Objetivos',titan:'Titanes',phoenix:'Fénix',tower:'Torres'}[group]}>{LANDMARKS.filter(place=>place.group===group).map(place=><option key={place.id} value={place.id}>{place.label}</option>)}</optgroup>)}</select></label>
    <div className="editor-row"><span>Equipo / estado</span><div className="marker-colors">{(Object.keys(MARKER_COLORS) as MarkerColor[]).map(color => <button key={color} className={marker.color === color ? 'active' : ''} style={{ '--marker-color': MARKER_COLORS[color] } as React.CSSProperties} onClick={() => onChange({ color })} aria-label={`Color ${color}`} aria-pressed={marker.color === color}/>)}</div></div>
    <label><span>Tamaño · {marker.size}px</span><input type="range" min="34" max="86" value={marker.size} onChange={e => onChange({ size: Number(e.target.value) })}/></label>
    <div className="editor-actions"><button onClick={onDuplicate}><Icon name="copy" size={15}/>Duplicar</button><button className="danger" onClick={onDelete}><Icon name="trash" size={15}/>Eliminar</button></div>
  </aside>
}
