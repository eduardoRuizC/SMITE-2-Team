import { MAPS } from '../data'
import type { MapId } from '../types'

export function MapSelector({ value, onChange }: { value: MapId; onChange: (map: MapId) => void }) {
  return <label className="select-control"><span>Vista</span><select value={value} onChange={e => onChange(e.target.value as MapId)} aria-label="Seleccionar vista del mapa">{MAPS.map(map => <option key={map.id} value={map.id}>{map.label}</option>)}</select></label>
}
