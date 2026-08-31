import { useRef } from 'react'
import type { BoardState } from '../types'
import { Icon } from './Icon'
import { Tooltip } from './Tooltip'

interface Props { state: BoardState; onSave: () => void; onExportPng: () => void; onExportJson: () => void; onImport: (file: File) => void; onReset: () => void; canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void }
export function ExportControls({ onSave, onExportPng, onExportJson, onImport, onReset, canUndo, canRedo, onUndo, onRedo }: Props) {
  const input = useRef<HTMLInputElement>(null)
  return <div className="top-actions">
    <div className="history-actions"><Tooltip text="Deshacer (Ctrl+Z)"><button className="icon-button" onClick={onUndo} disabled={!canUndo} aria-label="Deshacer"><Icon name="undo"/></button></Tooltip><Tooltip text="Rehacer (Ctrl+Mayús+Z)"><button className="icon-button" onClick={onRedo} disabled={!canRedo} aria-label="Rehacer"><Icon name="redo"/></button></Tooltip></div>
    <button onClick={onSave}><Icon name="save"/> <span>Guardar</span></button>
    <div className="export-menu"><button><Icon name="download"/><span>Exportar</span></button><div className="export-popover"><button onClick={onExportPng}><Icon name="image"/>Imagen PNG</button><button onClick={onExportJson}><Icon name="download"/>Estado JSON</button><button onClick={() => input.current?.click()}><Icon name="upload"/>Importar JSON</button></div></div>
    <input ref={input} type="file" accept="application/json,.json" hidden onChange={e => { const file=e.target.files?.[0]; if (file) onImport(file); e.currentTarget.value='' }}/>
    <Tooltip text="Restablecer pizarra"><button className="icon-button reset-button" onClick={onReset} aria-label="Restablecer pizarra"><Icon name="reset"/></button></Tooltip>
  </div>
}
