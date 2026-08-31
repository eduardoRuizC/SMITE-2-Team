import type { ToolMode } from '../types'
import { Icon } from './Icon'
import { Tooltip } from './Tooltip'

const TOOLS: { id: ToolMode; label: string; icon: string }[] = [
  { id: 'select', label: 'Seleccionar y mover', icon: 'cursor' }, { id: 'pen', label: 'Lápiz', icon: 'pen' },
  { id: 'arrow', label: 'Flecha', icon: 'arrow' }, { id: 'eraser', label: 'Borrador', icon: 'eraser' },
]
const COLORS = ['#28a9ff', '#ff5b45', '#ffc93d', '#4bd18b', '#ffffff']

interface Props { mode: ToolMode; setMode: (mode: ToolMode) => void; color: string; width: number; opacity: number; onDrawingChange: (value: { color?: string; width?: number; opacity?: number }) => void; onClear: () => void }
export function DrawingToolbar({ mode, setMode, color, width, opacity, onDrawingChange, onClear }: Props) {
  return <div className="drawing-toolbar" role="toolbar" aria-label="Herramientas de dibujo">
    <div className="tool-group">{TOOLS.map(tool => <Tooltip key={tool.id} text={tool.label}><button className={mode === tool.id ? 'active' : ''} onClick={() => setMode(tool.id)} aria-label={tool.label} aria-pressed={mode === tool.id}><Icon name={tool.icon}/></button></Tooltip>)}</div>
    <span className="toolbar-divider" />
    <div className="color-list" aria-label="Color del trazo">{COLORS.map(value => <button key={value} className={color === value ? 'active' : ''} style={{ '--swatch': value } as React.CSSProperties} onClick={() => onDrawingChange({ color: value })} aria-label={`Color ${value}`} aria-pressed={color === value}/>)}</div>
    <label className="compact-select"><span>Trazo</span><select value={width} onChange={e => onDrawingChange({ width: Number(e.target.value) })}><option value="2">Fino</option><option value="4">Medio</option><option value="8">Grueso</option></select></label>
    <label className="opacity-control"><span>Opacidad</span><input type="range" min="20" max="100" value={opacity * 100} onChange={e => onDrawingChange({ opacity: Number(e.target.value) / 100 })}/></label>
    <Tooltip text="Limpiar solo dibujos"><button onClick={onClear} aria-label="Limpiar dibujos"><Icon name="trash"/></button></Tooltip>
  </div>
}
